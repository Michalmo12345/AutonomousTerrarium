#pragma once

#include <stdint.h>

void lcd_init(void);
void lcd_clear(void);
void lcd_gotoxy(uint8_t col, uint8_t row);
void lcd_write_char(char c);
void lcd_write_str(const char *str);
void lcd_task(void *pvParameters);