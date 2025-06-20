
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
#include "led_task.h"
#include "water_level.h"
#include "heater_control.h"
#include "pump_control.h"

// PID_t pid;
void app_main(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    data_mutex = xSemaphoreCreateMutex();
    settings_mutex = xSemaphoreCreateMutex();

    // pid_init(&pid, 2.0, 5.0, 1.0, 25.0); // example values

    if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
    {
        shared_data.humidity = 50.0;
        shared_data.temperature = 24.0;
        xSemaphoreGive(data_mutex);
    }

    // if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
    // {
    //     app_settings.target_temperature = 25.0;
    //     app_settings.target_humidity = 50.0;
    //     app_settings.sprinkler_enabled = false;
    //     app_settings.leds_enabled = true;
    //     app_settings.heater_enabled = true;
    //     app_settings.heater_power_limit = 100.0; // Example value
    //     app_settings.manual_mode = false;        // Example value
    //     app_settings.color = COLOR_PURPLE;       // Example color
    //     xSemaphoreGive(settings_mutex);
    // }
    lcd_init();
    lcd_gotoxy(0, 0);
    lcd_write_str("Terrarium");
    lcd_gotoxy(0, 1);
    lcd_write_str("Laczenie...");
    if (wifi_init_sta())
    {
        lcd_gotoxy(0, 1);
        lcd_write_str("WiFi OK     ");
    }
    else
    {
        lcd_gotoxy(0, 1);
        lcd_write_str("WiFi blad   ");
    }
    xTaskCreate(lcd_task, "lcd_task", 8192, NULL, 9, NULL);
    xTaskCreate(http_get_task, "http_get_task", 8192, NULL, 5, NULL);
    xTaskCreate(http_post_task, "http_post_task", 8192, NULL, 5, NULL);
    // check priorities
    xTaskCreate(sensor_task, "sensor_task", 2048, NULL, 5, NULL);

    xTaskCreate(led_task, "led_task", 4096, NULL, 4, NULL);
    xTaskCreate(water_sensor_task, "water_sensor_task", 2048, NULL, 4, NULL);
    xTaskCreate(heater_control_task, "heater_control_task", 2048, NULL, 4, NULL);
    xTaskCreate(pump_control_task, "pump_control_task", 2048, NULL, 4, NULL);
}