# 🎓 Exam Cheating Detection System

A real-time facial monitoring system for detecting potential cheating during online exams using a webcam. Built using React, Face API, Framer Motion, and Tailwind CSS.

---

## 🚀 Features

- 👁️ Detects if the user is looking away from the screen.
- 📉 Tracks the cheating probability based on behavior.
- 🎥 Real-time webcam monitoring with facial landmarks.
- ⚠️ Alerts when suspicious activity is detected.
- 🧠 Visualizes data like warning count and status using ShadCN UI.
- 📈 Smooth animations and notifications using Framer Motion & Sonner.

---

## 🛠️ Tech Stack

### ⚙️ Core

- **React** + **TypeScript**
- **Vite** (for fast dev & builds)

### 🎯 Libraries

- [`face-api.js`](https://github.com/justadudewhohacks/face-api.js) – Face detection and landmark tracking
- [`framer-motion`](https://www.framer.com/motion/) – Smooth transitions and animations
- [`sonner`](https://sonner.emilkowal.ski/) – Toast notification system

### 🎨 UI

- **Tailwind CSS**
- **ShadCN UI** (Buttons, Alerts, Cards, Progress bars)

---

## 📸 What It Does

This project simulates a proctored environment where:

- The webcam tracks facial direction.
- If the user looks away too many times or no face is detected, the app:
  - Increases the "cheating probability" score.
  - Displays an overlay warning.
  - Logs the number of "looking away" events.

It's designed as a **frontend-only prototype** to showcase how AI-powered webcam detection could assist in exam proctoring.

---

## 😓 Challenges Faced

- 🎯 Accurate head direction estimation using only facial landmarks.
- 🎥 Handling webcam permissions and browser compatibility.
- 🧪 Tuning thresholds for what qualifies as "looking away".
- 💻 Ensuring real-time performance and minimal lag.

---

## 📦 Installation & Setup

To clone and run the project locally:

```bash
# 1. Clone the repo
git clone https://github.com/your-username/exam-cheating-detection.git

# 2. Navigate into the project folder
cd exam-cheating-detection

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
