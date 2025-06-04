// led_strip_task.c
#include "led_task.h"
#include "esp_log.h"
#include "driver/rmt_tx.h"
#include "led_strip_encoder.h"
#include <string.h>

#define RMT_LED_STRIP_RESOLUTION_HZ 10000000 // 10MHz resolution, 1 tick = 0.1us (led strip needs a high resolution)
#define RMT_LED_STRIP_GPIO_NUM 25

#define EXAMPLE_LED_NUMBERS 10
#define EXAMPLE_CHASE_SPEED_MS 200 // Slower refresh speed (increase delay to slow down)

static const char *TAG = "led_strip_task";

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

    ESP_LOGI(TAG, "Start LED green color");
    rmt_transmit_config_t tx_config = {
        .loop_count = 0, // no transfer loop
    };
    while (1)
    {
        for (int i = 0; i < EXAMPLE_LED_NUMBERS; i++)
        {
            // Set all LEDs to green (255 for green, 0 for red and blue)
            red = 0;     // No red
            green = 255; // Maximum green
            blue = 0;    // No blue

            led_strip_pixels[i * 3 + 0] = green;
            led_strip_pixels[i * 3 + 1] = blue;
            led_strip_pixels[i * 3 + 2] = red;
        }

        // Flush RGB values to LEDs
        ESP_ERROR_CHECK(rmt_transmit(led_chan, led_encoder, led_strip_pixels, sizeof(led_strip_pixels), &tx_config));
        ESP_ERROR_CHECK(rmt_tx_wait_all_done(led_chan, portMAX_DELAY));
        vTaskDelay(pdMS_TO_TICKS(EXAMPLE_CHASE_SPEED_MS)); // Slow refresh speed
    }
}
