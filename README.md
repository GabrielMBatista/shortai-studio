# ShortsAI Studio 🎬

The modern, AI-powered frontend interface for ShortsAI. Built with **React 19**, **Vite**, and **TailwindCSS**, designed to be the ultimate creative suite for vertical video generation.

## ✨ Features

### 🧠 AI-Powered Creation
- **Script Generation**: Powered by **Google Gemini 2.0 Flash**. Input a topic, get a viral script in seconds.
- **Visual Styles**: Consistent character and aesthetic generation (Cyberpunk, Anime, Realistic, etc.).
- **Personas**: Chat with AI personas to brainstorm ideas or define video tones.
- **Multi-Language**: Native support for **English** and **Portuguese (BR)**.

### 🎥 Video Studio & Rendering
- **Client-Side Rendering**: Videos are rendered directly in your browser using **WebCodecs**. No waiting for server queues!
- **Timeline Editor**: Drag-and-drop scene management.
- **Real-time Preview**: Watch your video being assembled scene by scene.
- **Audio Studio**: Integrate with **ElevenLabs** (voice) and **Suno/Riffusion** (music).
- **Export**: Render to MP4 (1080x1920) @ 30/60 FPS.

### 📢 Channels & Management
- **YouTube Integration**: Manage multiple channels, analyze performance.
- **Project Organization**: Folders, archives, and bulk generation from JSON.

## 🛠 Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS + Glassmorphism Design System
- **Icons**: Lucide React
- **State Management**: React Query + Context API
- **Rendering Engine**: WebCodecs / MediaRecorder (Canvas-based)
- **Internationalization**: i18next

## 🚀 Quick Start

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Create a `.env` file based on `.env.example`.
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
src/
├── api/            # API clients (axios)
├── components/     # Reusable UI components
│   ├── CreateProject/  # Main creation flow
│   ├── VideoPlayer/    # Custom video player & Exporter
│   └── Common/         # Buttons, cards, modals
├── hooks/          # Custom React hooks (useVideoExport)
├── locales/        # i18n JSON files (en/pt-BR)
├── pages/          # Application routes
├── services/       # Business logic (Scenes, Auth)
└── types/          # TypeScript definitions
```

## 🌍 Internationalization

All visible text should be wrapped in `t('key')` from `useTranslation`.
- Add new keys to `src/locales/en/translation.json` and `src/locales/pt-BR/translation.json`.

## 📦 Build

To create a production build:
```bash
npm run build
```