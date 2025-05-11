# ESP_PIAR – System sterowania terrarium z ESP32

Projekt oparty na mikrokontrolerze **ESP32**, realizowany w środowisku **ESP-IDF** z wykorzystaniem systemu **FreeRTOS**. System służy do monitorowania i sterowania warunkami panującymi w autonomicznym terrarium: wilgotnością, temperaturą, poziomem wody, oświetleniem i ogrzewaniem.

---

## 🔧 Technologie i biblioteki

- **FreeRTOS** – wielozadaniowość w czasie rzeczywistym
- **HTTP(S)** – wysyłanie danych do serwera z użyciem `esp_http_client`
- **I2C** – komunikacja z wyświetlaczem LCD 1602/2004
- **GPIO** – obsługa czujników i elementów wykonawczych (mata grzewcza, LEDy, zraszacz)
- **DHT** – odczyt temperatury i wilgotności

---

## 📁 Struktura projektu

Projekt opiera się na podziale na logiczne komponenty:


```
ESP_PIAR/
├── main/
│   ├── main.c
│   ├── lcd/
│   │   ├── lcd.c
│   │   └── lcd.h
│   ├── network/
│   │   ├── wifi.c
│   │   ├── wifi.h
│   │   ├── http_client.c
│   │   └── http_client.h
│   ├── shared_data.c
│   └── shared_data.h
│
├── config/
├── unused/
│   └── tcp_ip.c
├── CMakeLists.txt
```
w folderze ESP_PIAR/components znajdują się podstawowe drivery i konfiguracje komponentów dostarczone wraz z środowiskiem esp-idf
---

## 📦 Funkcjonalności systemu

- ✅ Odczyt temperatury i wilgotności z czujnika DHT
- ✅ Detekcja poziomu wody (czujnik pływakowy)
- ✅ Wyświetlanie danych na ekranie LCD przez I2C
- ✅ Sterowanie LEDami, matą grzewczą, zraszaczami przez GPIO
- ✅ Obliczanie mocy grzania na podstawie regulatora PI(D)
- ✅ Wysyłanie danych do serwera HTTP(S) w tle
- ✅ Wspólna struktura danych dostępna między taskami przez mutex (`FreeRTOS`)

---

## 🔄 Komunikacja między taskami

System wykorzystuje mechanizmy **FreeRTOS** do synchronizacji:

- `shared_data_t` – struktura z aktualnymi danymi systemowymi
- `xSemaphoreCreateMutex()` – do ochrony dostępu do danych między taskami (np. LCD, czujniki, HTTP)

---

## 📊 Wyświetlacz LCD

- Typ: LCD 1602 lub 2004
- Interfejs: I2C (np. PCF8574)
- Wyświetlane dane:
  - Temperatura i wilgotność
  - Stan wody (czujnik pływakowy)

---

## 🌐 Sieć

- ESP32 łączy się z siecią Wi-Fi jako klient (`wifi_init_sta`)
- Dane z czujników wysyłane są na zdalny serwer przez HTTPS (`esp_http_client`)

---

## 🚀 Status

Projekt w fazie implementacji i testowania.
Planowane dalsze rozszerzenia:
- zdalna konfiguracja parametrów przez aplikację lub stronę www
- tryb autonomiczny z lokalną pamięcią w przypadku braku internetu

---

## 📜 Licencja

Projekt edukacyjny/studencki. Do użytku prywatnego, rozwojowego i naukowego.
