// led_strip_task.c
// led_strip_task.c
#include "led_task.h"
#include "esp_log.h"
#include "driver/rmt_tx.h"
#include "led_strip_encoder.h"
#include <string.h>
#include "shared_data.h"

#define RMT_LED_STRIP_RESOLUTION_HZ 10000000 // 10MHz resolution, 1 tick = 0.1us (led strip needs a high resolution)
#define RMT_LED_STRIP_GPIO_NUM 12

#define EXAMPLE_LED_NUMBERS 1
#define EXAMPLE_CHASE_SPEED_MS 200 // Slower refresh speed (increase delay to slow down)

static const char *TAG = "led_strip_task";

void get_rgb_from_color(color_name_t color, uint32_t *red, uint32_t *green, uint32_t *blue)
{
    switch (color)
    {
    case COLOR_OFF:
        *red = 0;
        *green = 0;
        *blue = 0;
        break;
    case COLOR_GREEN:
        *red = 0;
        *green = 255;
        *blue = 0;
        break;
    case COLOR_RED:
        *red = 255;
        *green = 0;
        *blue = 0;
        break;
    case COLOR_BLUE:
        *red = 0;
        *green = 0;
        *blue = 255;
        break;
    case COLOR_YELLOW:
        *red = 255;
        *green = 255;
        *blue = 0;
        break;
    case COLOR_PURPLE:
        *red = 128;
        *green = 0;
        *blue = 128;
        break;
    case COLOR_CYAN:
        *red = 0;
        *green = 255;
        *blue = 255;
        break;
    case COLOR_WHITE:
        *red = 255;
        *green = 255;
        *blue = 255;
        break;
    case COLOR_ORANGE:
        *red = 255;
        *green = 165;
        *blue = 0;
        break;
    default:
        *red = 0;
        *green = 0;
        *blue = 0; // Default to off
        break;
    }
}

static uint8_t led_strip_pixels[EXAMPLE_LED_NUMBERS * 3];

void led_task(void *pvParameter)
{
    uint32_t red = 0;
    uint32_t green = 0;
    uint32_t blue = 0;

    ESP_LOGI(TAG, "Create RMT TX channel");
    rmt_channel_handle_t led_chan = NULL;
    rmt_tx_channel_config_t tx_chan_config = {
        .clk_src = RMT_CLK_SRC_DEFAULT, // select source clock
        .gpio_num = RMT_LED_STRIP_GPIO_NUM,
        .mem_block_symbols = 64, // increase the block size can make the LED less flickering
        .resolution_hz = RMT_LED_STRIP_RESOLUTION_HZ,
        .trans_queue_depth = 4, // set the number of transactions that can be pending in the background
    };
    ESP_ERROR_CHECK(rmt_new_tx_channel(&tx_chan_config, &led_chan));

    ESP_LOGI(TAG, "Install led strip encoder");
    rmt_encoder_handle_t led_encoder = NULL;
    led_strip_encoder_config_t encoder_config = {
        .resolution = RMT_LED_STRIP_RESOLUTION_HZ,
    };
    ESP_ERROR_CHECK(rmt_new_led_strip_encoder(&encoder_config, &led_encoder));

    ESP_LOGI(TAG, "Enable RMT TX channel");
    ESP_ERROR_CHECK(rmt_enable(led_chan));

    ESP_LOGI(TAG, "Start LED flashing sequence");
    rmt_transmit_config_t tx_config = {
        .loop_count = 0, // no transfer loop
    };

    // uint32_t last_toggle_time = 0; // Time of last toggle (for example purposes)
    // static bool leds_on = true;    // Flag to track LED states
    // static int color_index = 0;    // To track the current color in the sequence
    // bool previous_led_enabled = false;

    // while (1)
    // {
    //     // Flashing cycle every EXAMPLE_CHASE_SPEED_MS (200ms) interval
    //     if (esp_log_timestamp() - last_toggle_time > EXAMPLE_CHASE_SPEED_MS)
    //     {
    //         last_toggle_time = esp_log_timestamp();

    //         // Change color based on the current cycle
    //         switch (color_index)
    //         {
    //         case 0:
    //             // Flash Green
    //             green = 255;
    //             red = 0;
    //             blue = 0;
    //             break;
    //         // case 1:
    //         //     // Flash Red
    //         //     green = 0;
    //         //     red = 255;
    //         //     blue = 0;
    //         //     break;
    //         // case 2:
    //         //     // Flash Blue
    //         //     green = 0;
    //         //     red = 0;
    //         //     blue = 255;
    //         //     break;
    //         case 1:
    //             // Turn Off LEDs
    //             green = 0;
    //             red = 0;
    //             blue = 0;
    //             break;
    //         }

    //         // Update the color for all LEDs
    //         for (int i = 0; i < EXAMPLE_LED_NUMBERS; i++)
    //         {
    //             led_strip_pixels[i * 3 + 0] = green;
    //             led_strip_pixels[i * 3 + 1] = blue;
    //             led_strip_pixels[i * 3 + 2] = red;
    //         }

    //         // Send RGB values to LEDs
    //         ESP_ERROR_CHECK(rmt_transmit(led_chan, led_encoder, led_strip_pixels, sizeof(led_strip_pixels), &tx_config));
    //         ESP_ERROR_CHECK(rmt_tx_wait_all_done(led_chan, portMAX_DELAY));

    //         // Move to next color in the sequence
    //         color_index = (color_index + 1) % 2; // Loop through the sequence (0 - Green, 1 - Red, 2 - Blue, 3 - Off)
    //     }

    //     vTaskDelay(pdMS_TO_TICKS(10)); // Small delay for the task to run
    // }

    // uint32_t last_update_time = 0;
    // color_name_t previous_color = COLOR_OFF;
    // bool previous_led_enabled = false;

    // while (1)
    // {
    //     int current_color_int = COLOR_OFF;
    //     bool current_leds_enabled = false;

    //     if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
    //     {
    //         current_color_int = app_settings.color;
    //         current_leds_enabled = app_settings.leds_enabled;
    //         xSemaphoreGive(settings_mutex);
    //     }

    //     color_name_t current_color = COLOR_OFF;
    //     if (current_color_int >= COLOR_OFF && current_color_int <= COLOR_ORANGE)
    //     {
    //         current_color = (color_name_t)current_color_int;
    //     }
    //     else
    //     {
    //         ESP_LOGW(TAG, "Invalid color value: %d, defaulting to COLOR_OFF", current_color_int);
    //         current_color = COLOR_OFF;
    //     }

    //     bool settings_changed = false;

    //     if (current_color != previous_color ||
    //         current_leds_enabled != previous_led_enabled ||
    //         (esp_log_timestamp() - last_update_time > EXAMPLE_CHASE_SPEED_MS))
    //     {
    //         settings_changed = true;
    //         last_update_time = esp_log_timestamp();
    //         previous_color = current_color;
    //         previous_led_enabled = current_leds_enabled;
    //     }
    //     if (settings_changed)
    //     {
    //         // Check if LEDs are enabled
    //         if (current_leds_enabled)
    //         {
    //             // Get RGB values based on the color enum
    //             get_rgb_from_color(current_color, &red, &green, &blue);
    //             ESP_LOGI(TAG, "LED enabled - Color: %d (%s), RGB: (%d, %d, %d)",
    //                      current_color_int,
    //                      (current_color == COLOR_GREEN) ? "GREEN" : (current_color == COLOR_RED)  ? "RED"
    //                                                             : (current_color == COLOR_BLUE)   ? "BLUE"
    //                                                             : (current_color == COLOR_YELLOW) ? "YELLOW"
    //                                                             : (current_color == COLOR_PURPLE) ? "PURPLE"
    //                                                             : (current_color == COLOR_CYAN)   ? "CYAN"
    //                                                             : (current_color == COLOR_WHITE)  ? "WHITE"
    //                                                             : (current_color == COLOR_ORANGE) ? "ORANGE"
    //                                                                                               : "OFF",
    //                      red, green, blue);
    //         }
    //         else
    //         {

    //             red = 0;
    //             green = 0;
    //             blue = 0;
    //             ESP_LOGI(TAG, "LEDs disabled - turning off");
    //         }

    //         for (int i = 0; i < EXAMPLE_LED_NUMBERS; i++)
    //         {
    //             led_strip_pixels[i * 3 + 0] = green; // G
    //             led_strip_pixels[i * 3 + 1] = red;   // R
    //             led_strip_pixels[i * 3 + 2] = blue;  // B
    //         }

    //         // Send RGB values to LEDs
    //         ESP_ERROR_CHECK(rmt_transmit(led_chan, led_encoder, led_strip_pixels, sizeof(led_strip_pixels), &tx_config));
    //         ESP_ERROR_CHECK(rmt_tx_wait_all_done(led_chan, portMAX_DELAY));
    //     }

    //     vTaskDelay(pdMS_TO_TICKS(500));
    // }

    while (1)
    {

        int current_color_int = COLOR_OFF;
        bool current_leds_enabled = false;

        if (xSemaphoreTake(settings_mutex, pdMS_TO_TICKS(100)))
        {
            current_color_int = app_settings.color;
            current_leds_enabled = app_settings.leds_enabled;
            xSemaphoreGive(settings_mutex);
        }

        if (xSemaphoreTake(data_mutex, pdMS_TO_TICKS(100)))
        {
            shared_data.leds_on = current_leds_enabled;
            xSemaphoreGive(data_mutex);
        }

        color_name_t current_color = COLOR_OFF;
        if (current_color_int >= COLOR_OFF && current_color_int <= COLOR_ORANGE)
        {
            current_color = (color_name_t)current_color_int;
        }

        if (current_leds_enabled)
        {
            get_rgb_from_color(current_color, &red, &green, &blue);
        }
        else
        {
            red = 0;
            green = 0;
            blue = 0;
        }

        for (int i = 0; i < EXAMPLE_LED_NUMBERS; i++)
        {
            led_strip_pixels[i * 3 + 0] = green; // G
            led_strip_pixels[i * 3 + 1] = red;   // R
            led_strip_pixels[i * 3 + 2] = blue;  // B
        }

        ESP_ERROR_CHECK(rmt_transmit(led_chan, led_encoder, led_strip_pixels, sizeof(led_strip_pixels), &tx_config));
        ESP_ERROR_CHECK(rmt_tx_wait_all_done(led_chan, portMAX_DELAY));

        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
