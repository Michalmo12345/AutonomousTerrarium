#include "http_client.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_http_client.h"
#include <string.h>
#include <stdlib.h>
#include "config.h"
#include "shared_data.h"

static const char *TAG = "HTTP_CLIENT";

esp_err_t _http_event_handler(esp_http_client_event_t *evt)
{
    switch (evt->event_id)
    {
    case HTTP_EVENT_ON_DATA:
        if (!esp_http_client_is_chunked_response(evt->client))
        {
            char *buf = calloc(evt->data_len + 1, 1);
            if (buf)
            {
                memcpy(buf, evt->data, evt->data_len);
                ESP_LOGI(TAG, "Odebrano dane: %s", buf);
                free(buf);
            }
        }
        break;
    default:
        break;
    }
    return ESP_OK;
}

// void http_get_task(void *pvParameters)
// {
//     esp_http_client_config_t config = {
//         .url = WEB_SERVER,
//         .timeout_ms = 5000,
//         .event_handler = _http_event_handler,
//         .buffer_size = 512,
//         .buffer_size_tx = 256,
//         .transport_type = HTTP_TRANSPORT_OVER_TCP,
//     };

//     while (1)
//     {
//         esp_http_client_handle_t client = esp_http_client_init(&config);
//         esp_http_client_set_method(client, HTTP_METHOD_GET);
//         esp_http_client_set_header(client, "Connection", "close");

//         esp_err_t err = esp_http_client_perform(client);
//         if (err == ESP_OK)
//         {
//             ESP_LOGI(TAG, "HTTP GET status: %d", esp_http_client_get_status_code(client));
//         }
//         else
//         {
//             ESP_LOGE(TAG, "Błąd HTTP GET: %s", esp_err_to_name(err));
//         }

//         esp_http_client_cleanup(client);
//         vTaskDelay(pdMS_TO_TICKS(10000));
//     }
// }

// void http_post_task(void *pvParameters)
// {
//     while (1)
//     {
//         esp_http_client_config_t config = {
//             .url = WEB_SERVER,
//             .timeout_ms = 5000,
//         };

//         esp_http_client_handle_t client = esp_http_client_init(&config);
//         const char *post_data = "message=Hello_from_ESP32";

//         esp_http_client_set_method(client, HTTP_METHOD_POST);
//         esp_http_client_set_header(client, "Content-Type", "application/x-www-form-urlencoded");
//         esp_http_client_set_post_field(client, post_data, strlen(post_data));

//         esp_err_t err = esp_http_client_perform(client);
//         if (err == ESP_OK)
//         {
//             ESP_LOGI(TAG, "HTTP POST status: %d, length: %d",
//                      esp_http_client_get_status_code(client),
//                      esp_http_client_get_content_length(client));
//         }
//         else
//         {
//             ESP_LOGE(TAG, "HTTP POST error: %s", esp_err_to_name(err));
//         }

//         esp_http_client_cleanup(client);
//         vTaskDelay(pdMS_TO_TICKS(10000));
//     }
// }

void http_post_task(void *pvParameters)
{
    // const char *post_data = "{\"temperature\":28.5,\"humidity\":60}";
    const char *url = "http://13.60.201.150:5000/api/readings/20";
    const char *token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQ2OTkxNjExLCJleHAiOjE3NDY5OTUyMTF9.Tfks1jOA3wc_TGwjvsANLzXD1SUR70v1cumiobcNTGo";

    char post_data[128];

    while (1)
    {
        float temp = 0, hum = 0;

        // Pobierz dane ze struktury
        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            temp = shared_data.temperature;
            hum = shared_data.humidity;
            xSemaphoreGive(data_mutex);
        }

        // Stwórz JSON
        snprintf(post_data, sizeof(post_data),
                 "{\"temperature\":%.1f,\"humidity\":%.1f}", temp, hum);

        esp_http_client_config_t config = {
            .url = url,
            .timeout_ms = 5000,
            .event_handler = _http_event_handler,
            .buffer_size = 1024,
            .buffer_size_tx = 512,
        };

        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_http_client_set_method(client, HTTP_METHOD_POST);
        esp_http_client_set_header(client, "Content-Type", "application/json");
        esp_http_client_set_header(client, "Authorization", token);
        esp_http_client_set_post_field(client, post_data, strlen(post_data));

        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK)
        {
            ESP_LOGI(TAG, "HTTP POST status: %d, length: %d",
                     esp_http_client_get_status_code(client),
                     esp_http_client_get_content_length(client));
        }
        else
        {
            ESP_LOGE(TAG, "HTTP POST error: %s", esp_err_to_name(err));
        }

        esp_http_client_cleanup(client);
        vTaskDelay(pdMS_TO_TICKS(10000));
    }
}

void http_get_task(void *pvParameters)
{
    const char *url = "http://13.60.201.150:5000/api/terrariums/20";
    const char *token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzQ2OTkxNjExLCJleHAiOjE3NDY5OTUyMTF9.Tfks1jOA3wc_TGwjvsANLzXD1SUR70v1cumiobcNTGo";

    esp_http_client_config_t config = {
        .url = url,
        .timeout_ms = 5000,
        .event_handler = _http_event_handler,
        .buffer_size = 1024,
        .buffer_size_tx = 512,
        .transport_type = HTTP_TRANSPORT_OVER_TCP,
    };

    while (1)
    {
        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_http_client_set_method(client, HTTP_METHOD_GET);
        esp_http_client_set_header(client, "Content-Type", "application/json");
        esp_http_client_set_header(client, "Authorization", token);
        esp_http_client_set_header(client, "Connection", "close");

        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK)
        {
            ESP_LOGI(TAG, "HTTP GET status: %d", esp_http_client_get_status_code(client));
        }
        else
        {
            ESP_LOGE(TAG, "Błąd HTTP GET: %s", esp_err_to_name(err));
        }

        esp_http_client_cleanup(client);
        vTaskDelay(pdMS_TO_TICKS(10000));
    }
}
