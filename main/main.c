#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "nvs_flash.h"
#include "esp_http_client.h"

#define WIFI_SSID "MichalA55"
#define WIFI_PASS "xuic1259"
#define WEB_SERVER "http://192.168.114.67:5000/data"
// Adres serwera HTTP (np. lokalny Flask)

static const char *TAG = "HTTP_CLIENT";

static EventGroupHandle_t wifi_event_group;
#define WIFI_CONNECTED_BIT BIT0

// WiFi init (jak wcześniej)

static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
    {
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
    {
        esp_wifi_connect(); // Retry
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
    {
        xEventGroupSetBits(wifi_event_group, WIFI_CONNECTED_BIT);
    }
}
void wifi_init_sta(void)
{
    wifi_event_group = xEventGroupCreate(); // <-- TO DODAJ

    esp_netif_init();
    esp_event_loop_create_default();
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);

    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, wifi_event_handler, NULL);
    esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, wifi_event_handler, NULL);

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
        },
    };

    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config);
    esp_wifi_start();

    ESP_LOGI(TAG, "Connecting to WiFi...");

    // Czekaj aż się połączy
    EventBits_t bits = xEventGroupWaitBits(wifi_event_group,
                                           WIFI_CONNECTED_BIT,
                                           pdFALSE,
                                           pdFALSE,
                                           portMAX_DELAY);

    if (bits & WIFI_CONNECTED_BIT)
    {
        ESP_LOGI(TAG, "Połączono z WiFi, przechodzę do HTTP POST");
    }
    else
    {
        ESP_LOGE(TAG, "Nie udało się połączyć z WiFi");
    }
}

void http_post_task(void *pvParameters)
{
    while (1)
    {
        esp_http_client_config_t config = {
            .url = WEB_SERVER,
        };

        esp_http_client_handle_t client = esp_http_client_init(&config);

        const char *post_data = "message=Hello_from_ESP32";
        esp_http_client_set_method(client, HTTP_METHOD_POST);
        esp_http_client_set_header(client, "Content-Type", "application/x-www-form-urlencoded");
        esp_http_client_set_post_field(client, post_data, strlen(post_data));

        esp_err_t err = esp_http_client_perform(client);

        if (err == ESP_OK)
        {
            ESP_LOGI(TAG, "HTTP POST Status = %d, content_length = %d",
                     esp_http_client_get_status_code(client),
                     esp_http_client_get_content_length(client));
        }
        else
        {
            ESP_LOGE(TAG, "HTTP POST request failed: %s", esp_err_to_name(err));
        }

        esp_http_client_cleanup(client);
        vTaskDelay(5000 / portTICK_PERIOD_MS); // co 5 sekund
    }
}
void http_get_task(void *pvParameters)
{
    while (1)
    {
        esp_http_client_config_t config = {
            .url = WEB_SERVER, // np. http://192.168.114.67:5000/data
        };

        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_http_client_set_method(client, HTTP_METHOD_GET);
        esp_http_client_set_header(client, "Connection", "close");

        esp_err_t err = esp_http_client_perform(client);

        if (err == ESP_OK)
        {
            ESP_LOGI(TAG, "HTTP GET Status = %d",
                     esp_http_client_get_status_code(client));

            // Próbujemy odczytać treść odpowiedzi
            char buffer[128];
            int len = esp_http_client_read(client, buffer, sizeof(buffer) - 1);

            if (len > 0)
            {
                buffer[len] = '\0';
                ESP_LOGI(TAG, "Odebrano z serwera: %s", buffer);
            }
            else
            {
                ESP_LOGW(TAG, "Brak treści mimo poprawnego statusu");
            }
        }
        else
        {
            ESP_LOGE(TAG, "HTTP GET request failed: %s", esp_err_to_name(err));
        }

        esp_http_client_cleanup(client);
        vTaskDelay(pdMS_TO_TICKS(10000)); // co 10 sekund
    }
}

void app_main(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    wifi_init_sta();
    xTaskCreate(http_post_task, "http_post_task", 8192, NULL, 5, NULL);
    xTaskCreate(http_get_task, "http_get_task", 8192, NULL, 5, NULL);
}
