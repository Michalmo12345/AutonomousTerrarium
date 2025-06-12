#include "water_level.h"
#include "shared_data.h"

#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/task.h"

#define WATER_SENSOR_GPIO 32 // Dostosuj do używanego pinu GPIO
#define POLL_INTERVAL_MS 1000

static const char *TAG = "WATER_SENSOR";

extern system_data_t shared_data;
extern SemaphoreHandle_t data_mutex;

void water_sensor_task(void *pvParameters)
{
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << WATER_SENSOR_GPIO),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE};
    gpio_config(&io_conf);

    while (1)
    {
        bool level_ok = gpio_get_level(WATER_SENSOR_GPIO); // 1 = OK, 0 = brak wody

        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            shared_data.water_level_ok = level_ok;
            xSemaphoreGive(data_mutex);
        }

        ESP_LOGI(TAG, "Poziom wody: %s", level_ok ? "OK" : "BRAK");

        vTaskDelay(pdMS_TO_TICKS(POLL_INTERVAL_MS));
    }
}
