#include "pump_control.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "shared_data.h"

#define GPIO_PUMP_PIN 14         // Dostosuj ten pin do swojego układu
#define HUMIDITY_HYSTERESIS 5.0f // Histereza: ±5%

extern system_data_t shared_data;
extern app_settings_t app_settings;

extern SemaphoreHandle_t data_mutex;
extern SemaphoreHandle_t settings_mutex;

void pump_control_task(void *pvParameter)
{
    bool pump_on = false;

    gpio_set_direction(GPIO_PUMP_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(GPIO_PUMP_PIN, 0); // domyślnie wyłączona

    while (1)
    {
        float current_humidity = 0;
        float target_humidity = 0;
        bool sprinkler_enabled = false;
        bool manual_mode = false;
        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            current_humidity = shared_data.humidity;
            xSemaphoreGive(data_mutex);
        }

        if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
        {
            target_humidity = app_settings.target_humidity;
            sprinkler_enabled = app_settings.sprinkler_enabled;
            manual_mode = app_settings.manual_mode;
            xSemaphoreGive(settings_mutex);
        }

        ESP_LOGI("PUMP_CONTROL", "Wilgotność: %.1f%% / %.1f%%", current_humidity, target_humidity);

        if (!manual_mode)
        {
            if (!pump_on && current_humidity < (target_humidity - HUMIDITY_HYSTERESIS))
            {
                pump_on = true;
                gpio_set_level(GPIO_PUMP_PIN, 1);
                ESP_LOGI("PUMP_CONTROL", "Pompa WŁĄCZONA");
            }
            else if (pump_on && current_humidity > (target_humidity + HUMIDITY_HYSTERESIS))
            {
                pump_on = false;
                gpio_set_level(GPIO_PUMP_PIN, 0);
                ESP_LOGI("PUMP_CONTROL", "Pompa WYŁĄCZONA");
            }
        }
        else if (manual_mode && !sprinkler_enabled)
        {
            pump_on = false;
            gpio_set_level(GPIO_PUMP_PIN, 0);
            ESP_LOGI("PUMP_CONTROL", "Podlewanie wyłączone w ustawieniach");
        }
        else if (manual_mode && sprinkler_enabled)
        {
            pump_on = true;
            gpio_set_level(GPIO_PUMP_PIN, 1);
            ESP_LOGI("PUMP_CONTROL", "Podlewanie włączone w ustawieniach");
        }
        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            shared_data.sprinkler_on = pump_on;
            xSemaphoreGive(data_mutex);
        }
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
