// #include <stdio.h>
// #include <string.h>
// #include <stdlib.h>
// #include "freertos/FreeRTOS.h"
// #include "freertos/task.h"
// #include "esp_log.h"
// #include "esp_wifi.h"
// #include "esp_event.h"
// #include "esp_netif.h"
// #include "nvs_flash.h"
// #include "esp_http_client.h"

// #define WIFI_SSID "MichalA55"
// #define WIFI_PASS "xuic1259"
// #define WEB_SERVER "http://192.168.114.67:5000/data"

// static const char *TAG = "HTTP_CLIENT";
// static EventGroupHandle_t wifi_event_group;
// #define WIFI_CONNECTED_BIT BIT0

// esp_err_t _http_event_handler(esp_http_client_event_t *evt)
// {
//     switch (evt->event_id)
//     {
//     case HTTP_EVENT_ON_DATA:
//         if (!esp_http_client_is_chunked_response(evt->client))
//         {
//             char *buf = calloc(evt->data_len + 1, 1);
//             if (buf)
//             {
//                 memcpy(buf, evt->data, evt->data_len);
//                 ESP_LOGI(TAG, "Odebrano dane: %s", buf);
//                 free(buf);
//             }
//         }
//         break;
//     default:
//         break;
//     }
//     return ESP_OK;
// }

// // Handler Wi-Fi
// static void wifi_event_handler(void *arg, esp_event_base_t event_base,
//                                int32_t event_id, void *event_data)
// {
//     if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
//     {
//         esp_wifi_connect();
//     }
//     else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
//     {
//         esp_wifi_connect();
//     }
//     else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
//     {
//         xEventGroupSetBits(wifi_event_group, WIFI_CONNECTED_BIT);
//     }
// }

// void wifi_init_sta(void)
// {
//     wifi_event_group = xEventGroupCreate();

//     esp_netif_init();
//     esp_event_loop_create_default();
//     esp_netif_create_default_wifi_sta();

//     wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
//     esp_wifi_init(&cfg);

//     esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, wifi_event_handler, NULL);
//     esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, wifi_event_handler, NULL);

//     wifi_config_t wifi_config = {
//         .sta = {
//             .ssid = WIFI_SSID,
//             .password = WIFI_PASS,
//         },
//     };

//     esp_wifi_set_mode(WIFI_MODE_STA);
//     esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config);
//     esp_wifi_start();

//     ESP_LOGI(TAG, "Laczenie z WiFi...");
//     xEventGroupWaitBits(wifi_event_group, WIFI_CONNECTED_BIT, pdFALSE, pdFALSE, portMAX_DELAY);
//     ESP_LOGI(TAG, "Polaczono z WiFi");
// }

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

// void app_main(void)
// {
//     ESP_ERROR_CHECK(nvs_flash_init());
//     wifi_init_sta();
//     xTaskCreate(http_get_task, "http_get_task", 8192, NULL, 5, NULL);
//     xTaskCreate(http_post_task, "http_post_task", 8192, NULL, 5, NULL);
// }

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "wifi.h"
#include "http_client.h"
#include "nvs_flash.h"
#include "lcd.h"
#include "shared_data.h"

void app_main(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    data_mutex = xSemaphoreCreateMutex();
    lcd_init();
    lcd_gotoxy(0, 0);
    lcd_write_str("Terrarium");
    lcd_gotoxy(0, 1);
    lcd_write_str("Laczenie...");
    wifi_init_sta();

    xTaskCreate(http_get_task, "http_get_task", 8192, NULL, 5, NULL);
    xTaskCreate(http_post_task, "http_post_task", 8192, NULL, 5, NULL);
    xTaskCreate(lcd_task, "lcd_task", 2048, NULL, 2, NULL);
}
