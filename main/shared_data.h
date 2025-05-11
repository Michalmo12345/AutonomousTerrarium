#pragma once
#include "freertos/FreeRTOS.h"
#include <stdbool.h>
typedef struct
{

    TickType_t last_update;
} system_data_t;

extern system_data_t shared_data;
extern SemaphoreHandle_t data_mutex;