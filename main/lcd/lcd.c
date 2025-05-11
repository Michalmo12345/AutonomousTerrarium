#include "lcd.h"
#include "driver/i2c.h"
#include <string.h>
#include <freertos/task.h>
#include "esp_log.h"

#define I2C_PORT I2C_NUM_0
#define I2C_SDA 21
#define I2C_SCL 22
#define LCD_ADDR 0x27
#define LCD_FREQ 100000

#define LCD_BACKLIGHT 0x08
#define ENABLE 0x04
#define RW 0x02
#define RS 0x01

// Prosta funkcja do opóźnień w mikrosekundach
static void delay_us(uint32_t us)
{
    uint32_t cycles = us * 5; // dostosuj jeśli CPU = 240 MHz
    for (uint32_t i = 0; i < cycles; ++i)
    {
        __asm__ __volatile__("nop");
    }
}

static void lcd_write_byte(uint8_t data)
{
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (LCD_ADDR << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, data, true);
    i2c_master_stop(cmd);
    i2c_master_cmd_begin(I2C_PORT, cmd, pdMS_TO_TICKS(1000));
    i2c_cmd_link_delete(cmd);
}

static void lcd_send_nibble(uint8_t nibble, uint8_t mode)
{
    uint8_t data = nibble | mode | LCD_BACKLIGHT;
    lcd_write_byte(data | ENABLE);
    delay_us(1); // zamiast hal_esp_rom_delay_us(1)
    lcd_write_byte(data & ~ENABLE);
    delay_us(50); // zamiast hal_esp_rom_delay_us(50)
}

static void lcd_send_cmd(uint8_t cmd)
{
    lcd_send_nibble(cmd & 0xF0, 0);
    lcd_send_nibble((cmd << 4) & 0xF0, 0);
}

static void lcd_send_data(uint8_t data)
{
    lcd_send_nibble(data & 0xF0, RS);
    lcd_send_nibble((data << 4) & 0xF0, RS);
}

void lcd_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_SDA,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_io_num = I2C_SCL,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = LCD_FREQ};
    i2c_param_config(I2C_PORT, &conf);
    i2c_driver_install(I2C_PORT, conf.mode, 0, 0, 0);

    vTaskDelay(pdMS_TO_TICKS(50));
    lcd_send_nibble(0x30, 0);
    vTaskDelay(pdMS_TO_TICKS(5));
    lcd_send_nibble(0x30, 0);
    delay_us(150);
    lcd_send_nibble(0x30, 0);
    lcd_send_nibble(0x20, 0);

    lcd_send_cmd(0x28); // 4-bit, 2 lines
    lcd_send_cmd(0x08); // display off
    lcd_send_cmd(0x01); // clear
    vTaskDelay(pdMS_TO_TICKS(2));
    lcd_send_cmd(0x06); // entry mode
    lcd_send_cmd(0x0C); // display on
}

void lcd_clear(void)
{
    lcd_send_cmd(0x01);
    vTaskDelay(pdMS_TO_TICKS(2));
}

void lcd_gotoxy(uint8_t col, uint8_t row)
{
    const uint8_t row_offsets[] = {0x00, 0x40, 0x14, 0x54};
    lcd_send_cmd(0x80 | (col + row_offsets[row]));
}

void lcd_write_char(char c)
{
    lcd_send_data(c);
}

void lcd_write_str(const char *str)
{
    while (*str)
        lcd_write_char(*str++);
}
