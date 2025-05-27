#include "http_client.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_http_client.h"
#include <string.h>
#include <stdlib.h>
#include "config.h"
#include "shared_data.h"
#include "cJSON.h"

static const char *TAG = "HTTP_CLIENT";
// #define TAG "HTTP_GET"

esp_err_t _http_event_handler(esp_http_client_event_t *evt)
{
    switch (evt->event_id)
    {
    case HTTP_EVENT_ON_DATA:
        if (evt->user_data && !esp_http_client_is_chunked_response(evt->client))
        {
            strncat((char *)evt->user_data, (char *)evt->data, evt->data_len);
        }
        break;
    default:
        break;
    }
    return ESP_OK;
}

void http_post_task(void *pvParameters)
{
    const char *url = "http://13.60.201.150:5000/api/readings/20";
    // const char *token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQ2OTkxNjExLCJleHAiOjE3NDY5OTUyMTF9.Tfks1jOA3wc_TGwjvsANLzXD1SUR70v1cumiobcNTGo";
    const char *token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQ4MzQzNzUxLCJleHAiOjE3Nzk4Nzk3NTF9.75Q6W9iCcQ0bOQLacF6QwtcYUOd7jkdY931H7kb978o";
    char post_data[256];

    while (1)
    {
        float temp = 0, hum = 0;
        bool water_ok = false, heater = false, sprinkler = false, leds = false;

        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            temp = shared_data.temperature;
            hum = shared_data.humidity;
            water_ok = shared_data.water_level_ok;
            heater = shared_data.heater_on;
            sprinkler = shared_data.sprinkler_on;
            leds = shared_data.leds_on;
            xSemaphoreGive(data_mutex);
        }

        snprintf(post_data, sizeof(post_data),
                 "{\"temperature\":%.1f,\"humidity\":%.1f,"
                 "\"water_level_ok\":%s,\"heater_on\":%s,"
                 "\"sprinkler_on\":%s,\"leds_on\":%s}",
                 temp, hum,
                 water_ok ? "true" : "false",
                 heater ? "true" : "false",
                 sprinkler ? "true" : "false",
                 leds ? "true" : "false");

        esp_http_client_config_t config = {
            .url = url,
            .timeout_ms = 5000,
            .buffer_size = 1024,
            .buffer_size_tx = 512,
            .user_data = NULL // brak obsługi danych zwrotnych
        };

        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_http_client_set_method(client, HTTP_METHOD_POST);
        esp_http_client_set_header(client, "Content-Type", "application/json");
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "Bearer %s", token);
        esp_http_client_set_header(client, "Authorization", auth_header);
        // esp_http_client_set_header(client, "Authorization", token);
        esp_http_client_set_post_field(client, post_data, strlen(post_data));

        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK)
        {
            ESP_LOGI("HTTP_POST", "Status: %d", esp_http_client_get_status_code(client));
        }
        else
        {
            ESP_LOGE("HTTP_POST", "Error: %s", esp_err_to_name(err));
        }

        esp_http_client_cleanup(client);
        vTaskDelay(pdMS_TO_TICKS(10000));
    }
}

void http_get_task(void *pvParameters)
{
    const char *url = "http://13.60.201.150:5000/api/terrariums/20/settings";
    // const char *token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQ2OTkxNjExLCJleHAiOjE3NDY5OTUyMTF9.Tfks1jOA3wc_TGwjvsANLzXD1SUR70v1cumiobcNTGo";
    const char *token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQ4MzQzNzUxLCJleHAiOjE3Nzk4Nzk3NTF9.75Q6W9iCcQ0bOQLacF6QwtcYUOd7jkdY931H7kb978o";
    static char response_buffer[512];

    esp_http_client_config_t config = {
        .url = url,
        .timeout_ms = 5000,
        .event_handler = _http_event_handler,
        .user_data = response_buffer,
        .buffer_size = 1024,
        .buffer_size_tx = 512,
        .transport_type = HTTP_TRANSPORT_OVER_TCP,
    };

    while (1)
    {
        memset(response_buffer, 0, sizeof(response_buffer));

        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_http_client_set_method(client, HTTP_METHOD_GET);
        esp_http_client_set_header(client, "Content-Type", "application/json");
        char auth_header[256];
        snprintf(auth_header, sizeof(auth_header), "Bearer %s", token);
        esp_http_client_set_header(client, "Authorization", auth_header);
        // esp_http_client_set_header(client, "Authorization", token);
        esp_http_client_set_header(client, "Connection", "close");

        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK)
        {
            cJSON *root = cJSON_Parse(response_buffer);
            if (root)
            {
                cJSON *temp = cJSON_GetObjectItem(root, "temperature");
                cJSON *sprinkler = cJSON_GetObjectItem(root, "sprinkler_enabled");
                cJSON *leds = cJSON_GetObjectItem(root, "leds_enabled");
                cJSON *heater = cJSON_GetObjectItem(root, "heater_enabled");
                cJSON *manual = cJSON_GetObjectItem(root, "manual_mode");
                cJSON *color = cJSON_GetObjectItem(root, "color");
                cJSON *hum = cJSON_GetObjectItem(root, "humidity");

                if (cJSON_IsNumber(temp) &&
                    cJSON_IsBool(sprinkler) &&
                    cJSON_IsBool(leds) &&
                    cJSON_IsBool(heater) &&
                    cJSON_IsBool(manual) &&
                    cJSON_IsNumber(color) &&
                    cJSON_IsNumber(hum))
                {
                    if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
                    {
                        app_settings.target_temperature = temp->valuedouble;
                        app_settings.target_humidity = hum->valuedouble;
                        app_settings.sprinkler_enabled = cJSON_IsTrue(sprinkler);
                        app_settings.leds_enabled = cJSON_IsTrue(leds);
                        app_settings.heater_enabled = cJSON_IsTrue(heater);
                        app_settings.manual_mode = cJSON_IsTrue(manual);
                        app_settings.color = color->valueint;
                        app_settings.heater_power_limit = 0.0f; // brak w JSON – ustaw domyślnie
                        app_settings.last_updated = xTaskGetTickCount();

                        ESP_LOGI("APP_SETTINGS", "Zaktualizowano ustawienia:");
                        ESP_LOGI("APP_SETTINGS", "T=%.1f, H=%.1f", app_settings.target_temperature, app_settings.target_humidity);
                        ESP_LOGI("APP_SETTINGS", "sprinkler_enabled = %s", app_settings.sprinkler_enabled ? "true" : "false");
                        ESP_LOGI("APP_SETTINGS", "leds_enabled = %s", app_settings.leds_enabled ? "true" : "false");
                        ESP_LOGI("APP_SETTINGS", "heater_enabled = %s", app_settings.heater_enabled ? "true" : "false");
                        ESP_LOGI("APP_SETTINGS", "manual_mode = %s", app_settings.manual_mode ? "true" : "false");
                        ESP_LOGI("APP_SETTINGS", "color = %d", app_settings.color);
                        xSemaphoreGive(settings_mutex);
                    }

                    ESP_LOGI("HTTP_GET", "Zaktualizowano: T=%.1f, H=%.1f", temp->valuedouble, hum->valuedouble);
                }

                cJSON_Delete(root);
            }
            else
            {
                ESP_LOGW("HTTP_GET", "Nieprawidłowy JSON: %s", response_buffer);
            }
        }
        else
        {
            ESP_LOGE("HTTP_GET", "Błąd: %s", esp_err_to_name(err));
        }

        esp_http_client_cleanup(client);
        vTaskDelay(pdMS_TO_TICKS(10000));
    }
}
