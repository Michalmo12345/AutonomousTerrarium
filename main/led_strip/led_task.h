#ifndef LED_TASK_H
#define LED_TASK_H

#include <stdint.h>
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"

typedef enum
{
    COLOR_OFF = 0,
    COLOR_GREEN,
    COLOR_RED,
    COLOR_BLUE,
    COLOR_YELLOW,
    COLOR_PURPLE,
    COLOR_CYAN,
    COLOR_WHITE,
    COLOR_ORANGE
} color_name_t;

typedef struct
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
} rgb_color_t;

// Zwraca kolor RGB na podstawie indeksu z app_settings.color
rgb_color_t get_color_from_enum(int color_index);

// Główne zadanie LED
void led_task(void *pvParameters);
#endif // LED_TASK_H