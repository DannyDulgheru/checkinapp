# Building IPA for Sideloadly

Since you're on Windows, we'll use EAS Build cloud service to create the IPA file.

## Option 1: Build with Free Apple ID (Recommended)

Run this command interactively:
```bash
npx eas-cli build --platform ios --profile unsigned
```

When prompted:
1. **"Do you want to log in to your Apple account?"** → Answer **Y** (Yes)
2. Enter your **free Apple ID email** and **password**
3. EAS will handle the code signing automatically

**Note:** 
- Free Apple ID apps expire after 7 days (need to reinstall)
- This will create a signed IPA that Sideloadly can install

## Option 2: Build Non-Interactively (If you already have credentials stored)

```bash
npm run build:ios:unsigned
```

## After Build Completes

1. **Download the IPA:**
   - Visit the build URL provided in the terminal
   - Or go to: https://expo.dev/accounts/dannydulgheru/projects/appmobile/builds
   - Click on the completed build
   - Download the `.ipa` file

2. **Install with Sideloadly:**
   - Open Sideloadly application
   - Drag & drop the `.ipa` file
   - Connect your iOS device via USB
   - Enter your Apple ID (Sideloadly will handle signing)
   - Click "Start"

## Troubleshooting

- **Build requires credentials:** Run the command interactively (without `--non-interactive`)
- **Can't download IPA:** Check the build page on expo.dev for download link
- **Sideloadly installation fails:** Make sure:
  - Device is trusted (check iOS Settings)
  - USB connection is stable
  - Apple ID credentials are correct


