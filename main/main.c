// #include <stdio.h>
// #include "esp_log.h"
// #include "driver/gpio.h"
// #include "freertos/FreeRTOS.h"
// #include "freertos/task.h"

// static const char *TAG = "esp32-led-blink";

// void blink_task(void)
// {
//     // Configure the GPIO as an output
//     gpio_reset_pin(GPIO_NUM_2);
//     gpio_set_direction(GPIO_NUM_2, GPIO_MODE_OUTPUT);

//     while (1)
//     {
//         // Turn on the LED
//         gpio_set_level(GPIO_NUM_2, 1);
//         ESP_LOGI(TAG, "LED turned on");
//         vTaskDelay(100 / portTICK_PERIOD_MS);

//         // Turn off the LED
//         gpio_set_level(GPIO_NUM_2, 0);
//         ESP_LOGI(TAG, "LED turned off");
//         vTaskDelay(100 / portTICK_PERIOD_MS);
//     }
// }

// WIFI testing

// #include <string.h>
// #include "freertos/FreeRTOS.h"
// #include "freertos/task.h"
// #include "esp_wifi.h"
// #include "esp_event.h"
// #include "esp_log.h"
// #include "nvs_flash.h"
// #include "lwip/sockets.h"
// #include "lwip/netdb.h"
// #include "esp_netif.h"

// #define WIFI_SSID "MichalA55"
// #define WIFI_PASS "xuic1259"
// #define HOST_IP_ADDR "192.168.195.67" // Replace with your PC/server IP
// #define PORT 1234                     // Replace with your server port

// static const char *TAG = "wifi_send";

// void wifi_init_sta(void)
// {
//     esp_netif_init();
//     esp_event_loop_create_default();
//     esp_netif_create_default_wifi_sta();

//     wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
//     esp_wifi_init(&cfg);

//     wifi_config_t wifi_config = {
//         .sta = {
//             .ssid = WIFI_SSID,
//             .password = WIFI_PASS,
//         },
//     };

//     esp_wifi_set_mode(WIFI_MODE_STA);
//     esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
//     esp_wifi_start();

//     ESP_LOGI(TAG, "Connecting to WiFi...");
//     esp_wifi_connect();
// }

// void send_data(void *pvParameters)
// {
//     char payload[] = "Hello from ESP32!";
//     struct sockaddr_in dest_addr;
//     dest_addr.sin_addr.s_addr = inet_addr(HOST_IP_ADDR);
//     dest_addr.sin_family = AF_INET;
//     dest_addr.sin_port = htons(PORT);

//     int sock = socket(AF_INET, SOCK_STREAM, IPPROTO_IP);
//     if (sock < 0)
//     {
//         ESP_LOGE(TAG, "Unable to create socket");
//         vTaskDelete(NULL);
//         return;
//     }

//     ESP_LOGI(TAG, "Socket created, connecting...");
//     if (connect(sock, (struct sockaddr *)&dest_addr, sizeof(dest_addr)) != 0)
//     {
//         ESP_LOGE(TAG, "Socket unable to connect");
//         close(sock);
//         vTaskDelete(NULL);
//         return;
//     }

//     ESP_LOGI(TAG, "Connected, sending data...");
//     send(sock, payload, strlen(payload), 0);
//     ESP_LOGI(TAG, "Message sent");

//     close(sock);
//     vTaskDelete(NULL);
// }

// void app_main(void)
// {
//     nvs_flash_init();
//     wifi_init_sta();

//     // Wait for IP (very basic way — production code should use event handler)
//     vTaskDelay(pdMS_TO_TICKS(5000));

//     xTaskCreate(send_data, "send_data", 4096, NULL, 5, NULL);
// }

// receiving from wifi testing

#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "esp_netif.h"

#define WIFI_SSID "MichalA55"
#define WIFI_PASS "xuic1259"
#define PORT 1234

static const char *TAG = "TCP_CLIENT";
static EventGroupHandle_t wifi_event_group;
#define WIFI_CONNECTED_BIT BIT0

// ==== Wi-Fi Connection Events ====
static void wifi_event_handler(void *arg, esp_event_base_t event_base,
                               int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
    {
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
    {
        esp_wifi_connect();
        ESP_LOGI(TAG, "Retrying Wi-Fi...");
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
    {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(TAG, "Got IP: " IPSTR, IP2STR(&event->ip_info.ip));
        xEventGroupSetBits(wifi_event_group, WIFI_CONNECTED_BIT);
    }
}

// ==== Wi-Fi Setup ====
void wifi_init_sta(void)
{
    wifi_event_group = xEventGroupCreate();
    esp_netif_init();
    esp_event_loop_create_default();
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);
    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL);
    esp_event_handler_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL);

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
        },
    };

    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(ESP_IF_WIFI_STA, &wifi_config);
    esp_wifi_start();

    ESP_LOGI(TAG, "Connecting to Wi-Fi...");
    xEventGroupWaitBits(wifi_event_group, WIFI_CONNECTED_BIT, false, true, portMAX_DELAY);
}

// ==== TCP Client Task ====
void tcp_client_task(void *pvParameters)
{
    struct sockaddr_in dest_addr;
    dest_addr.sin_addr.s_addr = inet_addr("192.168.195.67");
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(PORT);

    int sock = socket(AF_INET, SOCK_STREAM, IPPROTO_IP);
    if (sock < 0)
    {
        ESP_LOGE(TAG, "Unable to create socket: errno %d", errno);
        vTaskDelete(NULL);
        return;
    }

    int err = connect(sock, (struct sockaddr *)&dest_addr, sizeof(dest_addr));
    if (err != 0)
    {
        ESP_LOGE(TAG, "Socket unable to connect: errno %d", errno);
        close(sock);
        vTaskDelete(NULL);
        return;
    }

    ESP_LOGI(TAG, "Connected to server");

    char rx_buffer[128];
    while (1)
    {
        int len = recv(sock, rx_buffer, sizeof(rx_buffer) - 1, 0);
        if (len <= 0)
            break;

        rx_buffer[len] = 0;
        ESP_LOGI(TAG, "Received: %s", rx_buffer);
    }

    close(sock);
    vTaskDelete(NULL);
}

void app_main(void)
{
    nvs_flash_init();
    wifi_init_sta();
    xTaskCreate(tcp_client_task, "tcp_client", 4096, NULL, 5, NULL);
}
