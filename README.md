# WasteLink PH

> Digitizing waste management for informal waste pickers in the Philippines 🇵🇭

## Overview

WasteLink PH is a mobile-first, offline-first application designed for informal waste pickers (*basureros*) in the Philippines. It replaces paper logbooks with a digital platform for collection tracking, AI-powered recyclable sorting, marketplace bidding, and earnings management.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Expo App       │────▶│   Laravel API    │────▶│   PostgreSQL     │
│  (React Native)  │     │   (Docker)       │     │   + Redis        │
│  + TF.js AI      │     │   + Queue Worker │     │                  │
│  + Offline Sync  │     │   + Nginx        │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Expo CLI (`npm install -g @expo/cli`)

### Frontend (Expo)
```bash
cd frontend
npm install
npx expo start          # Dev mode (Expo Go)
npx expo start --web    # Web/PWA mode
```

### Backend (Docker)
```bash
cp .env.example .env
# Edit .env with your credentials
docker-compose up -d
docker-compose exec api php artisan migrate --seed
```

### Environment Variables
Copy `.env.example` and fill in:
| Variable | Description |
|---|---|
| `APP_KEY` | Laravel app key |
| `JWT_SECRET` | JWT signing secret |
| `DB_PASSWORD` | PostgreSQL password |
| `TWILIO_SID` | Twilio Account SID |
| `TWILIO_TOKEN` | Twilio Auth Token |
| `TWILIO_FROM` | Twilio phone number |

## Project Structure

```
wastelink-ph/
├── frontend/              # Expo (React Native + Web)
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API, sync, offline, AI
│   │   ├── context/       # React context providers
│   │   ├── i18n/          # Tagalog/English translations
│   │   └── theme/         # Design tokens
│   └── App.js
├── backend/               # Laravel 10 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── ai-models/             # TensorFlow.js model
├── docker-compose.yml
├── tests/
└── README.md
```

## Features

- 📱 **Low-Literacy UI** — Icon-first design, Tagalog/English, voice prompts
- 📡 **100% Offline** — Full CRUD offline, delta sync on reconnect
- 🤖 **AI Sorting** — Camera scan classifies recyclables (PET, HDPE, metal, paper, organic)
- 🗺️ **GPS Tracking** — Map-based collection routes with photo timestamps
- 💰 **Marketplace** — Real-time bids from buyers/co-ops
- 💳 **Digital Wallet** — Earnings tracking, GCash/Maya integration
- 🏥 **Health & Safety** — Log exposures, auto-alert nearest clinic
- 📊 **Admin Dashboard** — Analytics, compliance reports (RA 9003)

## Target Specs

- **Load time**: <3s on 2GB RAM Android
- **Offline**: 99% usage without connectivity
- **Sync**: Auto on 3G/WiFi, conflict resolution via last-write-wins
- **Security**: Encrypted local data, JWT auth, rate-limiting

## License

Proprietary — WasteLink PH © 2026
