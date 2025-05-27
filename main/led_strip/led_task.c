#include "led_task.h"
#include "shared_data.h"

#include "led_strip.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED_STRIP_GPIO 12
#define NUM_LEDS 3

static const char *TAG = "LED_TASK";

extern app_settings_t app_settings;
extern SemaphoreHandle_t settings_mutex;

rgb_color_t get_color_from_enum(int color_index)
{
    switch ((color_name_t)color_index)
    {
    case COLOR_GREEN:
        return (rgb_color_t){0, 255, 0};
    case COLOR_RED:
        return (rgb_color_t){255, 0, 0};
    case COLOR_BLUE:
        return (rgb_color_t){0, 0, 255};
    case COLOR_YELLOW:
        return (rgb_color_t){255, 255, 0};
    case COLOR_PURPLE:
        return (rgb_color_t){128, 0, 128};
    case COLOR_CYAN:
        return (rgb_color_t){0, 255, 255};
    case COLOR_WHITE:
        return (rgb_color_t){255, 255, 255};
    case COLOR_ORANGE:
        return (rgb_color_t){255, 165, 0};
    case COLOR_OFF:
    default:
        return (rgb_color_t){0, 0, 0};
    }
}

void led_task(void *pvParameters)
{
    led_strip_t strip = {
        .type = LED_STRIP_WS2812,
        .length = NUM_LEDS,
        .gpio = LED_STRIP_GPIO,
        .buf = NULL,
        .channel = 0};

    ESP_ERROR_CHECK(led_strip_init(&strip));

    while (1)
    {
        bool manual = false;
        bool enabled = false;
        int color_index = 0;

        if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
        {
            manual = app_settings.manual_mode;
            enabled = app_settings.leds_enabled;
            color_index = app_settings.color;
            xSemaphoreGive(settings_mutex);
        }

        rgb_color_t color = (manual && enabled) ? get_color_from_enum(color_index) : (rgb_color_t){0, 0, 0};

        ESP_LOGI(TAG, "manual=%s, enabled=%s, color_index=%d, color=(R:%d G:%d B:%d)",
                 manual ? "true" : "false",
                 enabled ? "true" : "false",
                 color_index,
                 color.r, color.g, color.b);

        rgb_t rgb = {.r = color.r, .g = color.g, .b = color.b};

        esp_err_t err = led_strip_set_pixel(&strip, 0, rgb);
        if (err != ESP_OK)
        {
            ESP_LOGE(TAG, "led_strip_set_pixel failed: %s", esp_err_to_name(err));
        }

        err = led_strip_flush(&strip);
        if (err != ESP_OK)
        {
            ESP_LOGE(TAG, "led_strip_flush failed: %s", esp_err_to_name(err));
        }

        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
