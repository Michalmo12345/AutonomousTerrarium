#ifndef LED_STRIP_TASK_H
#define LED_STRIP_TASK_H

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
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

void get_rgb_from_color(color_name_t color, uint32_t *red, uint32_t *green, uint32_t *blue);
void led_task(void *pvParameter);

#endif // LED_STRIP_TASK_H