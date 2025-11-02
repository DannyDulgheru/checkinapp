# Building IPA File Instructions

This guide will help you generate an IPA file for your iOS app using Expo Application Services (EAS Build).

## Prerequisites

1. **Expo Account** (free): Create one at https://expo.dev/signup if you don't have one
2. **Apple Developer Account** (required for App Store distribution, $99/year)
   - Optional for internal/TestFlight distribution with a free Apple Developer account

## Steps to Generate IPA

### 1. Login to Expo
```bash
npx eas-cli login
```

### 2. Configure Your Project
```bash
npx eas-cli build:configure
```
This will set up your project for EAS builds.

### 3. Build Options

#### Option A: Preview Build (Internal Distribution - No App Store)
This creates an IPA file that can be installed via TestFlight or directly on devices:
```bash
npm run build:ios:preview
# or
npx eas-cli build --platform ios --profile preview
```

#### Option B: Production Build (App Store Distribution)
This creates an IPA file ready for App Store submission:
```bash
npm run build:ios:production
# or
npx eas-cli build --platform ios --profile production
```

### 4. Build Process

When you run the build command:
1. You'll be asked about credentials:
   - **Auto-manage credentials**: Recommended - EAS will handle certificates and provisioning profiles
   - **Manual**: You provide your own certificates

2. The build will:
   - Upload your project to Expo's servers
   - Build the iOS app in the cloud
   - Generate the IPA file
   - Provide download link when complete

### 5. Download Your IPA

Once the build completes:
- You'll receive a notification via email
- Visit https://expo.dev/accounts/[your-account]/builds to see all builds
- Click on the completed build to download the IPA file

### Alternative: Local Build (Advanced)

If you have a Mac with Xcode installed, you can build locally:
```bash
npx eas-cli build --platform ios --local
```

## Important Notes

- **Bundle Identifier**: Currently set to `com.appmobile.appmobile` in app.json
  - Change this if you have a registered bundle ID
- **Version**: Update `version` in app.json before each build
- **Build Time**: Cloud builds typically take 15-30 minutes
- **Free Tier**: EAS Build free tier includes limited builds per month

## Troubleshooting

If you encounter issues:
1. Make sure you're logged in: `npx eas-cli whoami`
2. Check your app.json configuration
3. Verify bundle identifier matches your Apple Developer account
4. Check EAS Build status: https://expo.dev/accounts/[your-account]/builds

## Next Steps After Building

1. **TestFlight**: Upload the IPA to TestFlight for beta testing
2. **App Store**: Submit the IPA for App Store review
3. **Direct Install**: Use tools like Transporter or Xcode to install on devices


