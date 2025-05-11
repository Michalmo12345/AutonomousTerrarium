#pragma once
#include "freertos/FreeRTOS.h"
#include <stdbool.h>
typedef struct
{
    float temperature;
    float humidity;
    bool water_level_ok;
    float heater_power;
    bool sprinkler_on;
    bool leds_on;
    TickType_t last_update;
} system_data_t;

extern system_data_t shared_data;
extern SemaphoreHandle_t data_mutex;