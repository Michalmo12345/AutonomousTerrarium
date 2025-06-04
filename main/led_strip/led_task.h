#ifndef LED_STRIP_TASK_H
#define LED_STRIP_TASK_H

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void led_task(void *pvParameter);

#endif // LED_STRIP_TASK_H