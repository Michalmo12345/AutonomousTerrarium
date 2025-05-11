
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
#include "sensor_temp_humidity.h"

void app_main(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    data_mutex = xSemaphoreCreateMutex();
    if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
    {
        shared_data.humidity = 50.0;
        shared_data.temperature = 24.0;
        xSemaphoreGive(data_mutex);
    }

    lcd_init();
    lcd_gotoxy(0, 0);
    lcd_write_str("Terrarium");
    lcd_gotoxy(0, 1);
    lcd_write_str("Laczenie...");
    wifi_init_sta();
    lcd_write_str("WiFi gotowe");

    xTaskCreate(http_get_task, "http_get_task", 8192, NULL, 5, NULL);
    xTaskCreate(http_post_task, "http_post_task", 8192, NULL, 5, NULL);
    xTaskCreate(lcd_task, "lcd_task", 2048, NULL, 2, NULL);
    xTaskCreate(sensor_task, "sensor_task", 2048, NULL, 5, NULL);
}
