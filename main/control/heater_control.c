// update later, just initial version for now

// heater_control.c

#include "heater_control.h"
#include "pid.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_system.h"
#include "esp_log.h"
#include "shared_data.h"

#define GPIO_HEATER_PIN 13 // Zmienna do dostosowania w zależności od pinu

extern system_data_t shared_data;
extern PID_t pid_controller;
extern SemaphoreHandle_t data_mutex;

void heater_control_task(void *pvParameter)
{
    while (1)
    {
        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            shared_data.heater_power = pid_compute(&pid_controller, shared_data.temperature);
            ESP_LOGI("HEATER_CONTROL", "Moc grzałki: %.1f%%", shared_data.heater_power);

            // przkeaźnik 0-1
            if (shared_data.heater_power > 50.0)
            {
                gpio_set_level(GPIO_HEATER_PIN, 1); // Włącz grzałkę
            }
            else
            {
                gpio_set_level(GPIO_HEATER_PIN, 0); // Wyłącz grzałkę
            }

            xSemaphoreGive(data_mutex);
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
