# MLSC Mobile App - Deployment Guide

This guide covers testing, building, and deploying the MLSC mobile app to iOS App Store and Google Play Store.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Testing](#local-testing)
4. [Building for Development](#building-for-development)
5. [Building for Production](#building-for-production)
6. [App Store Deployment (iOS)](#app-store-deployment-ios)
7. [Google Play Deployment (Android)](#google-play-deployment-android)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **Expo Account**
   - Sign up at https://expo.dev
   - Required for EAS Build and Push Notifications

2. **Apple Developer Account** (for iOS)
   - Cost: $99/year
   - Sign up at https://developer.apple.com
   - Required for App Store deployment

3. **Google Play Developer Account** (for Android)
   - One-time fee: $25
   - Sign up at https://play.google.com/console
   - Required for Play Store deployment

### Required Software

```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI
npm install -g eas-cli

# Git
git --version
```

---

## Environment Setup

### 1. Create `.env` File

Create `mlsc-mobile/.env`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://mlscsvec.in

# App Configuration
EXPO_PUBLIC_APP_NAME=MLSC App
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 2. Install Dependencies

```bash
cd mlsc-mobile
npm install
```

### 3. Login to Expo

```bash
expo login
# or
npx expo login
```

### 4. Initialize EAS

```bash
eas init
```

This will:
- Create an Expo project
- Generate a project ID
- Update `app.json` with the project ID

---

## Local Testing

### 1. Start Development Server

```bash
npm start
# or
npx expo start
```

This opens Expo Dev Tools in your browser.

### 2. Test on Physical Device

**Option A: Expo Go App**

1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan the QR code from terminal
3. App loads on your device

**Limitations:**
- Cannot test custom native code
- Cannot test push notifications fully
- Some features may not work

**Option B: Development Build (Recommended)**

1. Build development client:
   ```bash
   eas build --profile development --platform ios
   eas build --profile development --platform android
   ```

2. Install the build on your device
3. Start dev server: `npm start`
4. App connects to dev server

**Advantages:**
- Test all features including push notifications
- Debug like production app
- Custom native code works

### 3. Test on Simulator/Emulator

**iOS Simulator (macOS only):**
```bash
npm run ios
# or
npx expo start --ios
```

**Android Emulator:**
```bash
npm run android
# or
npx expo start --android
```

### 4. Run Tests

```bash
# Unit tests (if implemented)
npm test

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## Building for Development

Development builds include debugging tools and connect to your local development server.

### 1. Configure Build Profile

Already configured in `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 2. Build for iOS

```bash
# For physical device
eas build --profile development --platform ios

# For simulator
eas build --profile development --platform ios --simulator
```

**Output:** `.app` or `.ipa` file

**Install on device:**
1. Download from Expo dashboard
2. Drag to Xcode → Devices
3. Or use TestFlight for internal testing

### 3. Build for Android

```bash
eas build --profile development --platform android
```

**Output:** `.apk` file

**Install on device:**
1. Download from Expo dashboard
2. Transfer to device
3. Install APK (enable "Unknown sources" in settings)

---

## Building for Production

Production builds are optimized and ready for app store submission.

### 1. Update Version Numbers

Update `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

**Version Guidelines:**
- `version`: User-facing version (1.0.0, 1.0.1, 1.1.0)
- `buildNumber` (iOS): Increment for each build
- `versionCode` (Android): Integer, increment for each build

### 2. Configure App Icons and Splash Screen

Ensure these assets exist:

```
mlsc-mobile/assets/
├── icon.png              # 1024x1024 app icon
├── adaptive-icon.png     # 1024x1024 Android adaptive icon
├── splash-icon.png       # 1284x2778 splash screen
├── favicon.png           # 48x48 web favicon
└── notification-icon.png # 96x96 notification icon
```

### 3. Build Production Apps

**iOS:**
```bash
eas build --profile production --platform ios
```

**Android:**
```bash
eas build --profile production --platform android
```

**Both platforms:**
```bash
eas build --profile production --platform all
```

**Build Status:**
- Monitor builds at https://expo.dev/accounts/[username]/projects/mlsc-mobile/builds
- Receive email when build completes
- Download IPA/AAB files

---

## App Store Deployment (iOS)

### 1. Prerequisites

- Apple Developer Account ($99/year)
- App Store Connect access
- Valid signing certificate and provisioning profile (EAS handles this)

### 2. Configure Credentials

```bash
eas credentials
```

Select:
1. iOS
2. Production
3. Let EAS manage credentials automatically

### 3. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in details:
   - Platform: iOS
   - Name: MLSC App
   - Primary Language: English
   - Bundle ID: com.mlsc.app
   - SKU: mlsc-app-001

### 4. Configure App Information

**App Information:**
- Category: Education
- Subcategory: Educational Apps
- Content Rights: Check if applicable

**Pricing:**
- Price: Free
- Availability: All countries

**App Privacy:**
- Data Types Collected:
  - Name, Email (for application)
  - Device ID (for analytics)
  - Usage Data (for analytics)
- Data Usage:
  - App Functionality
  - Analytics
- Data Linked to User: Yes
- Tracking: No

### 5. Prepare App Store Listing

**Required Assets:**

1. **Screenshots** (use iPhone 15 Pro Max simulator):
   - 6.7" Display: 1290 x 2796 pixels
   - Need 3-10 screenshots showing key features:
     - Login screen
     - Events list
     - Application form
     - Team directory
     - Admin dashboard

2. **App Preview Video** (optional):
   - 15-30 seconds
   - Shows app in action

3. **Description:**
```
MLSC App is the official mobile application for the Microsoft Learn Student Club at SVEC.

Features:
• Browse and register for upcoming events and workshops
• Submit applications for team membership
• View current team members and their roles
• Track your application status in real-time
• Receive notifications for important updates
• Admin tools for managing applications and analytics

Join MLSC to enhance your technical and leadership skills, collaborate on exciting projects, and be part of a vibrant tech community!
```

4. **Keywords:**
```
microsoft,student,club,events,workshops,education,tech,community,svec
```

5. **Support URL:** https://mlscsvec.in/support
6. **Marketing URL:** https://mlscsvec.in
7. **Privacy Policy URL:** https://mlscsvec.in/privacy

### 6. Submit Build

**Option A: Manual Upload**

1. Download IPA from EAS build
2. Use Transporter app to upload to App Store Connect
3. Wait for processing (10-30 minutes)

**Option B: EAS Submit**

```bash
eas submit --platform ios
```

This automatically uploads the latest build.

### 7. Submit for Review

1. In App Store Connect, go to your app
2. Click "+" to create new version
3. Select the uploaded build
4. Fill in "What's New in This Version":
   ```
   Initial release of MLSC App

   Features:
   - Event browsing and registration
   - Team member applications
   - Application status tracking
   - Admin dashboard
   - Push notifications
   ```
5. Click "Submit for Review"

**Review Time:** Usually 1-3 days

**App Review Questions:**
- Demo account: Provide test credentials if needed
- Is your app restricted to specific users? Yes (SVEC students)
- Explain any special requirements

### 8. Post-Approval

Once approved:
- App status changes to "Ready for Sale"
- Available on App Store within 24 hours
- Search: "MLSC App" or "Microsoft Learn Student Club"

---

## Google Play Deployment (Android)

### 1. Prerequisites

- Google Play Developer Account ($25 one-time)
- Google Play Console access

### 2. Create Service Account for EAS

1. Go to https://console.cloud.google.com
2. Select your project (or create new)
3. Enable "Google Play Android Developer API"
4. Create Service Account:
   - Name: "EAS Submit"
   - Role: Service Account User
5. Create JSON key:
   - Download as `google-play-service-account.json`
   - Save in `mlsc-mobile/` (gitignored)

6. Grant Play Console access:
   - Go to https://play.google.com/console
   - Settings → API access
   - Link service account
   - Grant permissions: Release apps, View app information

### 3. Create App in Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in details:
   - App name: MLSC App
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
   - Declarations: Accept

### 4. Set Up App Content

**App Access:**
- Select "All or some functionality is restricted"
- Provide test credentials for restricted features

**Ads:**
- Select "No, my app does not contain ads"

**Content Rating:**
1. Click "Start questionnaire"
2. Category: Education, Reference
3. Answer questions honestly
4. Save and apply rating

**Target Audience:**
- Age groups: 13+ (or 18+ if you want to restrict to college students)

**Data Safety:**
- Types of data collected:
  - Personal info: Name, Email
  - App info: Device ID
- Data usage:
  - App functionality
  - Analytics
- Data sharing: No
- Security practices: Data encrypted in transit and at rest

**Privacy Policy:**
- URL: https://mlscsvec.in/privacy

**App Category:**
- Category: Education
- Tags: Events, Student Community, Workshops

### 5. Prepare Store Listing

**Required Assets:**

1. **App Icon:**
   - 512 x 512 PNG
   - Use `assets/icon.png`

2. **Feature Graphic:**
   - 1024 x 500 PNG
   - Create banner with logo and tagline

3. **Screenshots:**
   - Phone: 16:9 or 9:16 ratio
   - 7-inch tablet: 16:9 or 9:16 ratio
   - 10-inch tablet: 16:9 or 9:16 ratio
   - Need 2-8 screenshots per device type

4. **Short Description (80 chars):**
```
Official MLSC SVEC app - Events, applications, team directory, and more!
```

5. **Full Description (4000 chars):**
```
MLSC App is the official mobile application for the Microsoft Learn Student Club at Shri Vishnu Engineering College for Women.

🎓 ABOUT MLSC
The Microsoft Learn Student Club is a community of tech enthusiasts dedicated to learning, building, and growing together through workshops, hackathons, and collaborative projects.

✨ KEY FEATURES

📅 Events & Workshops
• Browse upcoming technical events and workshops
• View event details, schedules, and speakers
• Register for events directly from the app
• Receive reminders before events start

📝 Team Applications
• Submit applications to join the MLSC team
• Upload your resume and portfolio
• Choose your preferred technical and non-technical domains
• Track application status in real-time

👥 Team Directory
• View current MLSC team members
• See member roles and departments
• Connect with team members on LinkedIn
• Organized by technical and management teams

🔔 Notifications
• Get notified when your application status changes
• Receive event reminders
• Stay updated with important announcements

🛡️ Admin Features (For Team Members)
• Review and manage applications
• View analytics and statistics
• Manage events and registrations
• Track attendance and hiring metrics

📊 Analytics Dashboard
• Application statistics by domain, branch, and year
• Hiring conversion rates
• Interview attendance tracking
• Visual charts and insights

🔐 SECURE & RELIABLE
• Secure authentication for admins
• Firebase-backed real-time updates
• Offline support for uninterrupted access
• Privacy-focused data handling

🎯 WHO IS THIS FOR?
• SVEC students interested in joining MLSC
• Current MLSC team members and admins
• Anyone looking to attend MLSC events and workshops

🤝 JOIN THE COMMUNITY
Download the MLSC App today and be part of a vibrant tech community! Enhance your technical skills, build amazing projects, and grow your network.

📧 SUPPORT
For questions or issues: support@mlscsvec.in
Website: https://mlscsvec.in

Made with ❤️ by the MLSC SVEC team
```

### 6. Create Release

**Internal Testing (Recommended First):**

1. Go to "Internal testing"
2. Create new release
3. Upload AAB from EAS build
4. Add release notes
5. Add internal testers (email addresses)
6. Review and rollout

**Production Release:**

1. Go to "Production"
2. Create new release
3. Upload AAB:
   ```bash
   eas submit --platform android
   ```
4. Release notes:
   ```
   🎉 Initial Release - v1.0.0

   Features:
   ✅ Browse and register for MLSC events
   ✅ Submit team membership applications
   ✅ Track application status
   ✅ View team member directory
   ✅ Admin dashboard for team management
   ✅ Push notifications for updates
   ✅ Offline support

   This is the first public release of the MLSC App. We're excited to bring the MLSC experience to your mobile device!
   ```
5. Countries: Select all (or specific regions)
6. Review and rollout

**Review Time:** Usually 1-3 days (faster than iOS)

### 7. Post-Approval

- App goes live on Play Store
- Search: "MLSC App"
- Monitor reviews and ratings
- Respond to user feedback

---

## Post-Deployment

### 1. Monitor App Performance

**Crash Reporting:**
- Enable Sentry or Firebase Crashlytics
- Monitor crash-free rate
- Fix critical crashes immediately

**Analytics:**
- Track user engagement
- Monitor feature usage
- Identify drop-off points

**App Store Metrics:**
- Downloads
- Ratings and reviews
- User retention

### 2. Respond to Reviews

- Reply to all reviews (positive and negative)
- Address issues in updates
- Thank users for feedback

### 3. Plan Updates

**Version Update Cycle:**
- Minor updates (bug fixes): Every 2-4 weeks
- Feature updates: Every 1-3 months
- Major updates: As needed

**Update Process:**
1. Increment version in `app.json`
2. Build with EAS
3. Test thoroughly
4. Submit to stores
5. Monitor rollout

### 4. Marketing

- Announce launch on social media
- Create demo video
- Share in student groups
- Send email to students
- Put QR code on posters

---

## Troubleshooting

### Build Failures

**"Module not found" error:**
```bash
cd mlsc-mobile
rm -rf node_modules package-lock.json
npm install
eas build --clear-cache
```

**iOS code signing error:**
```bash
eas credentials
# Regenerate credentials
```

**Android Gradle error:**
- Check `build.gradle` syntax
- Ensure all dependencies are compatible
- Update Gradle version if needed

### Deployment Issues

**iOS: "Missing Compliance" warning:**
- Go to App Store Connect
- Answer export compliance questions
- Usually "No" for standard apps

**Android: "App not available in your country":**
- Check country availability in Play Console
- Ensure release is rolled out 100%

**Push Notifications not working:**
- Verify credentials are set up
- Check notification permissions
- Test with Expo Push Tool
- Review device logs

### App Rejected

**Common reasons:**
1. **Incomplete information** - Fill all required fields
2. **Crashes** - Test thoroughly before submitting
3. **Privacy policy missing** - Add valid privacy policy URL
4. **Inappropriate content** - Ensure content guidelines compliance
5. **Restricted features** - Provide demo account if needed

**Resolution:**
1. Read rejection reason carefully
2. Fix all issues mentioned
3. Respond to reviewer notes
4. Resubmit

---

## Maintenance Checklist

### Weekly
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Respond to support emails
- [ ] Review analytics

### Monthly
- [ ] Plan feature updates
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization

### Quarterly
- [ ] Major feature release
- [ ] User survey
- [ ] Competitive analysis
- [ ] Roadmap planning

---

## Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Guidelines](https://play.google.com/about/developer-content-policy/)

### Tools
- [Expo Dashboard](https://expo.dev)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com)

### Support
- [Expo Forums](https://forums.expo.dev)
- [Expo Discord](https://chat.expo.dev)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

## Quick Reference Commands

```bash
# Development
npm start                    # Start dev server
npm run ios                  # Run on iOS simulator
npm run android              # Run on Android emulator

# Building
eas build --profile development --platform all    # Dev builds
eas build --profile production --platform all     # Prod builds

# Submitting
eas submit --platform ios                         # Submit to App Store
eas submit --platform android                     # Submit to Play Store

# Credentials
eas credentials                                   # Manage credentials
eas build:configure                               # Reconfigure build

# Updates (OTA)
eas update --branch production --message "Bug fixes"  # Push update

# Cleanup
eas build --clear-cache                          # Clear build cache
```

---

## Next Steps

After successful deployment:

1. ✅ Test the live app from stores
2. ✅ Set up monitoring and analytics
3. ✅ Create marketing materials
4. ✅ Announce to users
5. ✅ Gather feedback
6. ✅ Plan next version

**Congratulations on deploying the MLSC Mobile App! 🎉**
