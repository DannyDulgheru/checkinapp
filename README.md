# Check-in App

A PWA (Progressive Web App) for tracking work check-ins with a timer, history, and Firebase synchronization.

## Features

- ⏱️ **Timer**: Start, pause, and resume check-in sessions
- 📊 **History**: View all past check-in sessions
- 🔐 **Authentication**: Email/password login with Firebase
- ☁️ **Cloud Sync**: All data synced to Firebase Firestore
- 📱 **PWA**: Installable on mobile devices
- 🎨 **Theme Support**: Light and dark themes
- 🔔 **Notifications**: Get notified when reaching target hours

## Tech Stack

- **React** 19.1.0
- **TypeScript**
- **Vite** 6.0.5
- **Firebase** 12.5.0 (Auth, Firestore)
- **React Router DOM** 7.1.0
- **React Icons** 5.4.0

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

App will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

Build output will be in `dist/` directory.

### Deploy

The app is configured for deployment on:
- **Vercel**: See `VERCEL_DEPLOY.md`
- **Firebase Hosting**: See Firebase docs

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** → Email/Password provider
3. Enable **Firestore Database**
4. Update Firebase config in `src/services/firebase.ts`
5. Set Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checkinData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Add your domain to Firebase Authorized domains (Authentication → Settings)

## Project Structure

```
src/
├── components/       # Reusable components
├── contexts/         # React contexts (Auth, Theme)
├── hooks/            # Custom React hooks
├── screens/          # Main app screens
├── services/         # Firebase and data services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Generate Icons

To regenerate app icons:

```bash
npm run generate-icons
```

Icons are generated in `public/icons/` directory.

## License

Private project
