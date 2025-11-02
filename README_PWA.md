# PWA iOS Support - Add to Home Screen

This app is configured as a Progressive Web App (PWA) that supports "Add to Home Screen" on iOS Safari.

## How to Add to Home Screen on iOS

1. **Open Safari on iOS device** (Safari only, not Chrome)
2. **Navigate to the app URL** (e.g., http://your-server:3000)
3. **Tap the Share button** (square with arrow pointing up)
4. **Scroll down and tap "Add to Home Screen"**
5. **Edit the name** if desired and tap "Add"

## PWA Features Enabled

- ✅ Standalone display mode (appears like a native app)
- ✅ Service Worker for offline support
- ✅ App icons for iOS
- ✅ Theme colors
- ✅ Portrait orientation lock
- ✅ Full-screen experience

## Requirements

- **HTTPS** (required for PWA on iOS) - use a local development server with HTTPS or deploy to a server with SSL
- **Safari browser** (iOS doesn't support PWAs in Chrome)
- **iOS 16.4+** for full PWA support

## Development Notes

- The service worker is registered automatically
- Icons should be in `/public/icons/` directory
- Manifest.json configures PWA behavior
- Service worker enables offline functionality

## Testing

1. Run the app: `npm run dev`
2. On iOS device, open Safari
3. Visit the app URL
4. Add to Home Screen
5. Launch from home screen icon

## Icons Required

- `/icons/apple-touch-icon.png` (180x180) - iOS home screen icon
- `/icons/icon-192.png` (192x192) - PWA icon
- `/icons/icon-512.png` (512x512) - PWA icon
- `/icons/favicon.png` - Browser favicon

