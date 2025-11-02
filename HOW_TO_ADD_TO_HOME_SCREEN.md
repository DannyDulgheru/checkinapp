# How to Add App to Home Screen on iOS Safari

## Step-by-Step Instructions

1. **Open Safari on your iPhone/iPad**
   - ⚠️ **Important**: Must use Safari, not Chrome or other browsers

2. **Navigate to your app**
   - Open: `http://192.168.0.145:3000` (or your server URL)
   - Or: `http://localhost:3000` if testing on same device

3. **Tap the Share Button**
   - Look for the square icon with an arrow pointing up
   - Usually at the bottom of Safari (iOS)

4. **Scroll down in the share menu**
   - Scroll through the share options

5. **Tap "Add to Home Screen"**
   - You'll see an icon preview and app name
   - Edit the name if desired

6. **Tap "Add"**
   - The app icon will appear on your home screen

7. **Launch the app**
   - Tap the icon on your home screen
   - App will open in standalone mode (no Safari UI)

## Requirements for iOS PWA

- ✅ Safari browser (iOS only)
- ✅ iOS 16.4 or later (for full PWA support)
- ⚠️ HTTPS required for service workers (for offline features)
- ✅ Manifest.json configured
- ✅ Icons provided

## Testing Locally

**For local testing (HTTP):**
- App will work, but service workers won't work
- "Add to Home Screen" will still work
- Offline features may be limited

**For production (HTTPS):**
- Full PWA support
- Service workers enabled
- Offline functionality
- Background sync

## Features Available

- ✅ Standalone app mode (no browser UI)
- ✅ App icon on home screen
- ✅ Full-screen experience
- ✅ Theme colors
- ✅ Portrait orientation
- ✅ Works offline (with HTTPS + service worker)

## Troubleshooting

**"Add to Home Screen" not showing:**
- Make sure you're using Safari
- Try refreshing the page
- Check that manifest.json is accessible

**Service Worker not working:**
- Requires HTTPS (except localhost)
- Check browser console for errors
- Verify `/sw.js` is accessible

