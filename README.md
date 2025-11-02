# Check-in App (React Native iOS)

A React Native application for tracking check-in and check-out times with notifications.

## Features

- ⏰ Check-in/Check-out timer
- 📋 History tracking
- 🔔 Notifications at 9 hours and every 5 minutes after
- 💾 Persistent storage using AsyncStorage
- 📱 Native iOS app

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- iOS Simulator (for testing) or physical iOS device
- Xcode (for iOS development)
- Expo CLI

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. For iOS:
```bash
npm run ios
```

This will:
- Start the Metro bundler
- Open the iOS Simulator (if Xcode is installed)
- Install and run the app

## Running on a Physical iOS Device

1. Install the Expo Go app from the App Store on your iOS device
2. Make sure your computer and device are on the same Wi-Fi network
3. Run `npm start` or `npm run ios`
4. Scan the QR code with your device's camera or the Expo Go app
5. The app will load on your device

## Project Structure

```
appmobile/
├── src/
│   ├── screens/         # App screens (CheckInScreen, HistoryScreen)
│   ├── services/        # Services (storage, notifications, push)
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Navigation setup
├── App.tsx             # Root App component
├── index.js            # Entry point
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage
- Expo Notifications
- React Native Safe Area Context

## Development

The app has been converted from a React web app to React Native. Key changes:

- **Storage**: Migrated from `localStorage` to `@react-native-async-storage/async-storage`
- **Notifications**: Migrated from Web Notifications API to Expo Notifications
- **Components**: Converted from HTML elements (`div`, `button`, etc.) to React Native components (`View`, `TouchableOpacity`, `Text`)
- **Styling**: Converted from CSS to React Native StyleSheet
- **Navigation**: Implemented using React Navigation instead of manual tab switching

## Building for Production

To build for production iOS:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure your project:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

## Troubleshooting

- **Metro bundler issues**: Clear cache with `npm start -- --reset-cache`
- **iOS Simulator not opening**: Make sure Xcode is installed and Command Line Tools are set up
- **Notification permissions**: The app will request notification permissions on first launch

## License

Private
