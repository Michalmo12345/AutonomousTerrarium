#include "http_client.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_http_client.h"
#include <string.h>
#include <stdlib.h>

#define WEB_SERVER "http://192.168.114.67:5000/data"
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

void http_get_task(void *pvParameters)
{
    esp_http_client_config_t config = {
        .url = WEB_SERVER,
        .timeout_ms = 5000,
        .event_handler = _http_event_handler,
        .buffer_size = 512,
        .buffer_size_tx = 256,
        .transport_type = HTTP_TRANSPORT_OVER_TCP,
    };

    while (1)
    {
        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_http_client_set_method(client, HTTP_METHOD_GET);
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

void http_post_task(void *pvParameters)
{
    while (1)
    {
        esp_http_client_config_t config = {
            .url = WEB_SERVER,
            .timeout_ms = 5000,
        };

        esp_http_client_handle_t client = esp_http_client_init(&config);
        const char *post_data = "message=Hello_from_ESP32";

        esp_http_client_set_method(client, HTTP_METHOD_POST);
        esp_http_client_set_header(client, "Content-Type", "application/x-www-form-urlencoded");
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
