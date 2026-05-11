# 🛰️ ConnectCall

### Next-Gen Intelligent Communication Infrastructure

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

**ConnectCall** is a premium, full-stack video conferencing platform designed for high-performance communication and AI-driven collaboration. It merges cinematic UI design with robust real-time synchronization to deliver an "Award-Level" user experience.

---

## ✨ Core Features

### 📡 Real-Time Communication
- **Ultra-Low Latency Video/Audio**: Powered by WebRTC and Socket.io signaling.
- **Dynamic Layout Engines**: Choose between Grid view, Focus mode (speaker tracking), and Theater mode.
- **Active Speaker Detection**: Real-time visual feedback for the current speaker.

### 🛡️ Enterprise-Grade Security
- **Secure Endpoints**: All sessions are gated by Firebase Authentication.
- **Encrypted Metadata**: AES-256 equivalent logic for room passwords and data transmission.
- **Host Empowerment**: Advanced controls to mute participants, kick users, and terminate broadcasts instantly.

### 🧠 AI Intellect Sidebar
- **Contextual Chat**: Real-time messaging with persistence via Firestore.
- **AI Brain**: Integrated AI assistant capabilities (Gemini-ready) for session intelligence.
- **Smart Summaries**: (Roadmap) Automatic extraction of meeting minutes and action items.

### 📱 Cinematic Experience
- **Fluid Motion**: Powered by `motion/react` for buttery-smooth transitions and micro-interactions.
- **Responsive Architecture**: Fully optimized for Desktop, Tablet, and One-Hand mobile usage.
- **Glassmorphism UI**: High-contrast, futuristic dark theme with precision typography.

---

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Real-time**: [Socket.io](https://socket.io/) + [Simple-Peer](https://github.com/feross/simple-peer)
- **Backend**: [Express](https://expressjs.com/) (Node.js)
- **Database/Auth**: [Firebase](https://firebase.google.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Firebase Project](https://console.firebase.google.com/)
- Gemini API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sabeerhub/connect-call.git
   cd connect-call
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_key
   ```
   *Note: Firebase configuration is automatically loaded from `firebase-applet-config.json`.*

4. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 🏛️ Project Structure

```text
├── src/
│   ├── components/    # Reusable UI components (Shadcn + Custom)
│   ├── features/      # Feature-based architecture (Dashboard, Meeting, Landing)
│   ├── firebase/      # Firestore services and Auth logic
│   ├── rtc/           # WebRTC hooks and signaling logic
│   ├── lib/           # Utility functions (cn, etc.)
│   └── App.tsx        # Main application router
├── server.ts          # Express + Socket.io backend
└── firebase.rules     # Hardened security rules for Firestore
```

---

## 👨‍💻 Architect

**Made with ❤️ by Sabeer**

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/_msabeer_)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sabeerhub)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/masabeer)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
