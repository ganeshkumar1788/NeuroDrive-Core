# 🏎️ FUTURE DRIVEN: Core Intelligence System

[![Platform: ESP32](https://img.shields.io/badge/Hardware-ESP32-E67E22?logo=espressif)](https://www.espressif.com/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![Safety: CRITICAL Override](https://img.shields.io/badge/Safety-CRITICAL_Override-red)]()

FUTURE DRIVEN is a state-of-the-art, emotion-aware vehicle control system that bridges real-time hardware telemetry with a cinematic, glassmorphic digital cockpit. Built for high-performance and driver safety, the system uses a dual-redundancy failover engine to ensure uninterupted operation across Serial and Cloud communication channels.

## 🚀 Key Features

### 🧠 Emotion-Aware Intelligence
- **Real-Time Monitoring:** Monitors driver state across CALM, AGGRESSIVE, FATIGUED, and CRITICAL modes.
- **Safety Overrides:** Automatically throttles motor speed based on driver emotions and eye-closure duration.
- **Immediate Damping:** Instant 15% speed reduction upon eye-closure detection for early intervention.

### 📡 Fault-Tolerant Communication
- **Hybrid Failover Engine:** Seamlessly switches between **Serial (COM9)** for low-latency control and **Cloud (ThingSpeak)** for remote redundancy.
- **Self-Healing Heartbeat:** Automatically reconnects to hardware as soon as physical links are restored.

### 💎 Cinematic Dashboard
- **Glassmorphism Design:** A premium, "frosted glass" UI with backdrop-blur effects and dyanmic light gradients.
- **Deep-Blue Cockpit:** High-contrast telemetry visualization designed for 120fps responsiveness.
- **Professional Analytics:** real-time Safety Index and Emotion Tracking nodes.

## 🛠️ Technology Stack
- **Hardware:** ESP32, L298N Motor Driver, Potentiometer, RGB LED, Buzzer.
- **Backend:** Node.js, Express.js, SerialPort.js, ThingSpeak API.
- **Frontend:** React, Vite, TailwindCSS, Framer Motion, Lucide Icons.

## ⚙️ Installation & Setup

### 1. ESP32 Firmware
Flash the `.ino` file in the `esp32_firmware/` directory to your ESP32. Ensure the WiFi credentials match your local setup.

### 2. Backend Decision Engine
```bash
cd backend
npm install
node server.js
```

### 3. Digital Cockpit
```bash
cd frontend
npm install
npm run dev
```

## 🛡️ Safety Protocols
| State | Trigger | Action |
| :--- | :--- | :--- |
| **CAUTION** | Eye Closure (0-10s) | -15% Speed Damping |
| **FATIGUED** | Eye Closure (10s+) | Fixed at 18 KM/H + Buzzer |
| **CRITICAL** | Eye Closure (15s+) | Total Stop (0 KM/H) + Buzzer + Red LED |

---
Designed for the future of intelligent mobility. 🛣️✨
