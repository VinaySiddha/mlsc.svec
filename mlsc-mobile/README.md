# MLSC Mobile App

Official mobile application for the Microsoft Learn Student Club at Shri Vishnu Engineering College for Women.

---

## Overview

The MLSC Mobile App provides a complete recruitment and event management experience for both students and administrators. Built with React Native and Expo, it offers native iOS and Android apps with real-time updates, offline support, and push notifications.

### Key Features

**For Students:**
- 📅 Browse and register for events
- 📝 Submit team membership applications
- 📊 Track application status in real-time
- 👥 View team member directory
- 💼 Explore job opportunities
- 🔔 Receive push notifications for updates

**For Admins:**
- 📋 Review and manage applications
- 📈 View analytics and statistics
- ✅ Mark interview attendance
- 🎯 Filter and search applications
- 📊 Visualize data with charts

---

## Tech Stack

- **Framework:** React Native 0.81 with Expo SDK 54
- **Language:** TypeScript
- **Navigation:** React Navigation v7 (Stack + Drawer + Bottom Tabs)
- **UI Library:** React Native Paper (Material Design 3)
- **State Management:** Zustand
- **Backend:** Firebase (Firestore + Storage) + REST API
- **Forms:** React Hook Form + Zod validation
- **Charts:** react-native-chart-kit
- **Authentication:** JWT with refresh tokens
- **Notifications:** Expo Notifications
- **Offline:** Firestore offline persistence + AsyncStorage

---

## Project Structure

```
mlsc-mobile/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   ├── events/        # Events browsing & registration
│   │   ├── applications/  # Application submission & tracking
│   │   ├── team/          # Team member directory
│   │   ├── jobs/          # Job listings
│   │   └── admin/         # Admin features
│   ├── navigation/        # Navigation configuration
│   ├── store/            # Zustand stores
│   ├── services/         # API clients and Firebase config
│   ├── types/            # TypeScript type definitions
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions and validation
│   └── theme/            # App theming
├── assets/               # Images, icons, fonts
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
└── package.json         # Dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode (macOS only) or Expo Go app
- Android: Android Studio or Expo Go app

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/mlsc-app.git
   cd mlsc-app
   git checkout mobile
   cd mlsc-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**

   Create `.env` file:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_API_BASE_URL=https://mlscsvec.in
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - **iOS:** Press `i` in terminal or `npm run ios`
   - **Android:** Press `a` in terminal or `npm run android`
   - **Expo Go:** Scan QR code with Expo Go app

---

## Development

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser (limited support)
npm test           # Run tests (when implemented)
```

### Architecture

The app uses a **hybrid backend architecture**:

1. **Direct Firebase SDK** for public data reads:
   - Events collection
   - Team members (active only)
   - Team categories
   - Jobs
   - Notifications

2. **REST API** for mutations and sensitive operations:
   - Authentication (JWT)
   - Application submissions
   - Event registrations
   - Admin actions (reviews, analytics)

This provides:
- ✅ Real-time updates for public data
- ✅ Secure mutations through validated endpoints
- ✅ Centralized business logic
- ✅ Protection against unauthorized access

### State Management

Uses Zustand for lightweight, performant state management:

```typescript
// Example: Auth Store
const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userRole: null,
  login: async (username, password) => {
    // Login logic
  },
  logout: async () => {
    // Logout logic
  },
}));
```

### API Client

Centralized API client with automatic token refresh:

```typescript
// src/services/api.ts
const apiClient = {
  login: (username: string, password: string) => { ... },
  submitApplication: (data: ApplicationData, resume: File) => { ... },
  getApplications: (filters: ApplicationFilters) => { ... },
  // ... other methods
};
```

### Offline Support

- Firestore automatically caches all read data
- AsyncStorage for authentication tokens
- Queued mutations sync when online
- Pull-to-refresh for manual updates

See [OFFLINE_AND_NOTIFICATIONS.md](./OFFLINE_AND_NOTIFICATIONS.md) for details.

### Push Notifications

- Expo Notifications for cross-platform support
- Permission handling on app launch
- Deep linking to relevant screens
- Background and foreground notifications

See [OFFLINE_AND_NOTIFICATIONS.md](./OFFLINE_AND_NOTIFICATIONS.md) for setup.

---

## Building

### Development Build

For testing all features including push notifications:

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build

For app store submission:

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android

# Both
eas build --profile production --platform all
```

Monitor builds at: https://expo.dev

---

## Deployment

### iOS App Store

1. **Configure credentials:**
   ```bash
   eas credentials
   ```

2. **Build production IPA:**
   ```bash
   eas build --profile production --platform ios
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

4. **Complete App Store Connect setup:**
   - App information
   - Pricing & availability
   - App privacy details
   - Screenshots & description

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Google Play Store

1. **Create service account** in Google Cloud Console

2. **Build production AAB:**
   ```bash
   eas build --profile production --platform android
   ```

3. **Submit to Play Store:**
   ```bash
   eas submit --platform android
   ```

4. **Complete Play Console setup:**
   - Store listing
   - Content rating
   - Pricing & distribution
   - App content

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## Testing

Comprehensive testing checklist covering:
- Authentication flows
- User features (events, applications, team, jobs)
- Admin features (review, analytics)
- Navigation
- Offline mode
- Push notifications
- Performance
- Security
- Platform-specific tests
- Accessibility

See [TESTING.md](./TESTING.md) for complete test guide.

### Quick Test

```bash
# Type checking
npx tsc --noEmit

# Linting (if configured)
npm run lint

# Unit tests (when implemented)
npm test
```

---

## Security

### Firebase Security Rules

Firestore rules restrict mobile access:
- ✅ Public read: events, team (active), jobs, notifications
- 🔒 No direct write access (use REST API)
- 🔒 Protected: applications, authTokens

Storage rules:
- ✅ Public read: images (events, team, speakers)
- 🔒 Protected: resumes (no public access)

### Authentication

- JWT access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Stored securely in Expo SecureStore
- Automatic token refresh on expiry

### Data Protection

- Input validation with Zod schemas
- File type and size validation
- SQL injection prevention
- XSS protection

See [FIREBASE_SECURITY.md](../FIREBASE_SECURITY.md) for details.

---

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Building and deploying to app stores
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[OFFLINE_AND_NOTIFICATIONS.md](./OFFLINE_AND_NOTIFICATIONS.md)** - Offline support and push notifications
- **[FIREBASE_SECURITY.md](../FIREBASE_SECURITY.md)** - Firebase security rules and setup

---

## Troubleshooting

### Common Issues

**"Module not found" error:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**Build failures:**
```bash
eas build --clear-cache
```

**iOS simulator not opening:**
```bash
sudo xcode-select --switch /Applications/Xcode.app
```

**Android emulator issues:**
- Ensure Android Studio is installed
- Set `ANDROID_HOME` environment variable
- Create AVD in Android Studio

---

## Contributing

1. Create a feature branch from `mobile`
2. Make your changes
3. Test thoroughly
4. Submit pull request
5. Wait for review

### Code Style

- TypeScript for type safety
- ESLint for linting
- Prettier for formatting
- Meaningful variable names
- Comments for complex logic

### Commit Messages

Follow conventional commits:
```
feat: Add event registration feature
fix: Fix application submission bug
docs: Update README
style: Format code with Prettier
refactor: Reorganize component structure
test: Add unit tests for validation
```

---

## Support

- **Issues:** https://github.com/your-org/mlsc-app/issues
- **Email:** support@mlscsvec.in
- **Website:** https://mlscsvec.in

---

## License

MIT License - see [LICENSE](../LICENSE) for details

---

## Acknowledgments

- Microsoft Learn Student Club SVEC
- Expo team for amazing developer experience
- React Native community
- Firebase team
- All contributors

---

## Roadmap

### Version 1.1
- [ ] In-app notifications inbox
- [ ] Event calendar integration
- [ ] Dark mode support
- [ ] Rich notifications with images
- [ ] Application draft saving

### Version 1.2
- [ ] Chat with team members
- [ ] Project showcase
- [ ] Achievement badges
- [ ] Social sharing
- [ ] Multilingual support

### Version 2.0
- [ ] Video interviews integration
- [ ] AI-powered application review
- [ ] Advanced analytics
- [ ] Community forum
- [ ] Gamification

---

**Made with ❤️ by MLSC SVEC Team**
