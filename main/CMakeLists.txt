idf_component_register(
    SRCS "main.c"
         "network/wifi.c"
         "network/http_client.c"
         "lcd/lcd.c"
         "shared_data.c"
         "sensors/sensor_temp_humidity.c"
         "led_strip/led_rgb.c"
         "pid/pid.c"
         "control/heater_control.c"
         "control/pump_control.c"
    INCLUDE_DIRS "."
                 "network" "lcd" "sensors" "led_strip" "pid" "control"
)