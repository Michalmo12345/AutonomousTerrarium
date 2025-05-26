#include "heater_control.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "shared_data.h"

#define GPIO_HEATER_PIN 13          // Pin grzałki
#define TEMPERATURE_HYSTERESIS 1.0f // Histereza ±1°C

extern system_data_t shared_data;
extern app_settings_t app_settings;

extern SemaphoreHandle_t data_mutex;
extern SemaphoreHandle_t settings_mutex;

void heater_control_task(void *pvParameter)
{
    bool heater_on = false;

    gpio_set_direction(GPIO_HEATER_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(GPIO_HEATER_PIN, 0); // domyślnie wyłączona

    while (1)
    {
        float current_temp = 0.0f;
        float target_temp = 0.0f;
        bool heater_enabled = false;
        bool manual_mode = false;

        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            current_temp = shared_data.temperature;
            xSemaphoreGive(data_mutex);
        }

        if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
        {
            target_temp = app_settings.target_temperature;
            heater_enabled = app_settings.heater_enabled;
            manual_mode = app_settings.manual_mode;
            xSemaphoreGive(settings_mutex);
        }

        ESP_LOGI("HEATER_CONTROL", "Temperatura: %.1f°C / %.1f°C", current_temp, target_temp);

        if (!manual_mode)
        {
            if (!heater_on && current_temp < (target_temp - TEMPERATURE_HYSTERESIS))
            {
                heater_on = true;
                gpio_set_level(GPIO_HEATER_PIN, 1);
                ESP_LOGI("HEATER_CONTROL", "Grzałka WŁĄCZONA (automatycznie)");
            }
            else if (heater_on && current_temp > (target_temp + TEMPERATURE_HYSTERESIS))
            {
                heater_on = false;
                gpio_set_level(GPIO_HEATER_PIN, 0);
                ESP_LOGI("HEATER_CONTROL", "Grzałka WYŁĄCZONA (automatycznie)");
            }
        }
        else if (manual_mode && !heater_enabled)
        {
            heater_on = false;
            gpio_set_level(GPIO_HEATER_PIN, 0);
            ESP_LOGI("HEATER_CONTROL", "Grzałka WYŁĄCZONA (ręcznie)");
        }
        else if (manual_mode && heater_enabled)
        {
            heater_on = true;
            gpio_set_level(GPIO_HEATER_PIN, 1);
            ESP_LOGI("HEATER_CONTROL", "Grzałka WŁĄCZONA (ręcznie)");
        }

        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            shared_data.heater_on = heater_on;
            xSemaphoreGive(data_mutex);
        }
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
