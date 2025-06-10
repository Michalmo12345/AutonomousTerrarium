# 🌱 Autonomous Terrarium System

![Project Status: In Development](https://img.shields.io/badge/status-in--development-yellow)  
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

An end-to-end, self-regulating terrarium platform combining:

- **Web Application** (React + Node.js) deployed on AWS EC2  
- **Embedded Controller** (ESP32 + FreeRTOS) communicating over HTTPS  
- **3D-Printed Enclosure & Mounts** (STL/3MF files)

---

## 🧠 Project Overview

This modular system continuously monitors and controls:

- **Environmental Sensors**: temperature, humidity (DHT22), water level (float switch)
- **Actuators**: heating mat, LEDs, sprinkler  
- **Human Interface**: live dashboard, manual/automatic modes, remote configuration  

Three Git branches:

| Branch                 | Contents                                             |
| ---------------------- | ---------------------------------------------------- |
| **main**               | Full-stack web app (React front-end, Node.js API)    |
| **espHTTPcommunication** | ESP32 firmware (ESP-IDF + FreeRTOS + `esp_http_client`) |
| **models**             | 3D-printable STL/3MF files for enclosure & mounts    |

---

## 🌐 Web Application

### Technology Stack

- **Frontend**: React (hooks, context API, Tailwind CSS)  
- **Backend**: Node.js + Express, RESTful API  
- **Database**: PostgreSQL (hosted on AWS RDS or EC2)  
- **Authentication**: JWT tokens, `authContext.js` + `authService.js`  
- **Deployment**: AWS EC2 instance behind Nginx + PM2

### Features

- **Real-Time Dashboard**  
  - Live charts for temperature, humidity & water level  
  - Toggle between Manual & Automatic modes  
  - Set day/night thresholds  

- **User Management**  
  - Sign up / Sign in flows  
  - Password reset & profile page (coming soon)

- **API Endpoints** (Express routes in `/server/routes`)  
  - `GET /api/terrariums/:id/readings`  
  - `POST /api/terrariums/:id/settings`  
  - `POST /api/auth/login` / `POST /api/auth/register`

### Quickstart

1. **Clone & Install**

    ```bash
    git clone https://gitlab-stud.elka.pw.edu.pl/piar_student_projects/25l/z12.git
    cd z12
    cd main
    npm install
    ```

2. **Environment Variables**

    Copy `server/.env.example` → `server/.env` and set:

    ```dotenv
    PORT=5000
    DATABASE_URL=postgres://USER:PASS@HOST:PORT/DB_NAME
    JWT_SECRET=your_jwt_secret
    ```

3. **Run Locally**

    ```bash
    # Start backend
    cd server
    npm start

    # Start frontend
    cd ../client
    npm start
    ```

4. **Build & Deploy**

    - Frontend: `npm run build` → serve `/build` via Nginx  
    - Backend: use **PM2** on AWS EC2  
    - Secure with SSL (Let’s Encrypt + Nginx)

---

## 🔧 Embedded Controller (ESP32)

**Branch**: `espHTTPcommunication`  
**Framework**: ESP-IDF + FreeRTOS  

### Core Components

- **Tasks & Synchronization**  
  - `shared_data_t` guarded by `xSemaphoreCreateMutex()`  
  - Separate tasks: Sensor read, Display update, HTTP client  

- **Sensors & Actuators**  
  - DHT22 (temp & humidity)  
  - Float switch (water level)  
  - I2C LCD1602/2004 via PCF8574  
  - GPIO: heating mat, LEDs, sprinkler  
  - PI(D) control algorithm for temperature regulation  

- **Networking**  
  - Wi-Fi Station mode (`wifi_init_sta()`)  
  - HTTPS POST to web API (`esp_http_client`)

### Getting Started

1. **Set up ESP-IDF** (v4.x) and toolchain  
2. **Clone & Build**

    ```bash
    cd espHTTPcommunication/ESP_PIAR
    git submodule update --init components/esp-idf-lib
    idf.py set-target esp32
    idf.py menuconfig      # configure Wi-Fi SSID/PASS
    idf.py build flash monitor
    ```

---

## 🧱 3D-Printed Models

**Branch**: `models`  

- Enclosure panels, sensor mounts, cable clips  
- Formats: STL, 3MF (sliced for common FDM printers)  

👉 Inspect and customize in your favorite CAD/CAM tool before printing.

---

## 🚀 Roadmap

- [ ] Remote schedule & threshold management via web UI  
- [ ] Offline data logging on microSD when disconnected  
- [ ] User profiles & multi-terrarium support  
- [ ] Mobile-responsive dashboard  

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch: `git checkout -b feat/awesome-feature`  
3. Commit your changes: `git commit -m "Add awesome feature"`  
4. Push to your branch: `git push origin feat/awesome-feature`  
5. Open a merge request on GitLab

Please follow the [GitLab Flow](https://docs.gitlab.com/ee/topics/gitlab_flow.html) and add descriptive commit messages.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 📬 Contact

_Questions? Feedback? Bug reports?_  
Feel free to open an issue on GitLab.
