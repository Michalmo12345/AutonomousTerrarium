idf_component_register(
    SRCS "main.c"
         "network/wifi.c"
         "network/http_client.c"
    INCLUDE_DIRS "."
                 "network"
)