# Offline Support & Push Notifications Guide

This document explains the offline support and push notification features in the MLSC mobile app.

---

## Offline Support

### Overview

The mobile app supports offline functionality through:
- **Firestore Offline Persistence** - Automatic local caching of Firestore data
- **AsyncStorage** - Local storage for authentication tokens and app state
- **Service Worker Caching** (future) - Cache API responses

### How It Works

#### 1. Firestore Offline Persistence

Enabled in `src/services/firebase.ts`:

```typescript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
```

**What gets cached:**
- ✅ Events collection
- ✅ Team members collection
- ✅ Team categories collection
- ✅ Jobs collection
- ✅ Notifications collection
- ✅ Settings collection

**Automatic features:**
- Data is automatically cached when read
- Offline reads return cached data instantly
- Writes are queued and synced when online
- Real-time listeners continue working with cached data

#### 2. AsyncStorage for Local Data

Used for:
- Authentication tokens (JWT access & refresh tokens)
- User profile information
- Push notification tokens
- App preferences

**Storage locations:**
- `jwt_access_token` - JWT access token
- `jwt_refresh_token` - Refresh token
- `expo_push_token` - Push notification token
- `user_info` - User profile data

#### 3. Offline-First UI Patterns

The app implements these patterns:

**Loading States:**
```typescript
if (isLoading && !data) {
  return <ActivityIndicator />;
}
```

**Error Handling:**
```typescript
if (error && !data) {
  return <ErrorView message={error} />;
}
```

**Pull-to-Refresh:**
```typescript
<FlatList
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>
```

### Testing Offline Mode

1. Open the app and navigate to different screens
2. Enable Airplane Mode on your device
3. Navigate back to previously visited screens
4. Data should load from cache instantly
5. Try submitting an application - it will queue
6. Disable Airplane Mode
7. Queued mutations will sync automatically

---

## Push Notifications

### Overview

Push notifications are implemented using:
- **Expo Notifications API** - Cross-platform notification handling
- **Firebase Cloud Messaging** - Push notification delivery (backend)
- **Local Notifications** - For immediate alerts

### Setup Instructions

#### 1. Get Expo Project ID

First, create an Expo account and project:

```bash
cd mlsc-mobile
npx expo login
eas init
```

This will create a project and give you a project ID.

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

#### 2. Configure Push Credentials

For iOS (requires Apple Developer account):
```bash
eas credentials
```

For Android (automatic, uses FCM):
- No additional setup required
- Expo automatically handles FCM configuration

#### 3. Test Push Notifications

Use Expo Push Tool for testing:
1. Run the app and get the push token (check console logs)
2. Visit https://expo.dev/notifications
3. Enter the push token
4. Send a test notification

### Notification Types

The app handles three types of notifications:

#### 1. Application Status Updates

Triggered when an admin changes application status:

```typescript
{
  type: 'application_status',
  applicationId: 'MLSC-20250222-ABCD',
  status: 'Shortlisted',
  message: 'Your application has been shortlisted for interview'
}
```

**User Action:** Tapping opens the application status screen

#### 2. Event Reminders

Scheduled for registered events (1 day before):

```typescript
{
  type: 'event_reminder',
  eventId: 'event123',
  message: 'Your event "React Workshop" starts tomorrow at 10:00 AM'
}
```

**User Action:** Tapping opens the event detail screen

#### 3. General Notifications

For announcements and updates:

```typescript
{
  type: 'general',
  message: 'New job opportunities posted!'
}
```

**User Action:** Tapping just opens the app

### Implementation Details

#### Service: `src/services/notifications.ts`

**Key Functions:**

1. **registerForPushNotifications()**
   - Requests notification permissions
   - Gets Expo push token
   - Configures Android notification channel
   - Returns push token to store in backend

2. **scheduleLocalNotification(title, body, data, triggerSeconds)**
   - Schedules a local notification
   - Used for event reminders
   - Can trigger immediately or after delay

3. **addNotificationReceivedListener(callback)**
   - Listens for notifications when app is in foreground
   - Displays notification even if app is open

4. **addNotificationResponseListener(callback)**
   - Listens for notification taps
   - Handles navigation to relevant screen

#### Integration: `App.tsx`

**Initialization:**
```typescript
useEffect(() => {
  if (isAuthenticated) {
    registerForNotifications();
  }

  // Setup listeners
  notificationListener.current = notificationService.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
    }
  );

  responseListener.current = notificationService.addNotificationResponseListener(
    (response) => {
      handleNotificationTap(response.notification);
    }
  );

  return () => {
    // Cleanup listeners
  };
}, [isAuthenticated]);
```

**Navigation Handling:**
```typescript
const handleNotificationTap = (notification: Notifications.Notification) => {
  const data = notification.request.content.data as NotificationData;

  switch (data.type) {
    case 'application_status':
      navigationRef.current?.navigate('User', {
        screen: 'Apply',
        params: { referenceId: data.applicationId },
      });
      break;

    case 'event_reminder':
      navigationRef.current?.navigate('User', {
        screen: 'Events',
        params: {
          screen: 'EventDetail',
          params: { eventId: data.eventId },
        },
      });
      break;
  }
};
```

### Backend Integration (To Be Implemented)

To send push notifications from the backend:

#### 1. Store Push Tokens

When a user logs in, send their push token to the backend:

```typescript
// In authStore.ts after successful login
const pushToken = await notificationService.getPushToken();
if (pushToken) {
  await apiClient.updateUserPushToken(pushToken);
}
```

Backend endpoint: `POST /api/v1/users/push-token`

```typescript
// Store in Firestore user document
await db.collection('users').doc(userId).update({
  pushToken: token,
  pushTokenUpdatedAt: new Date(),
});
```

#### 2. Send Notifications from Backend

Create a notification service in the backend:

**File:** `src/lib/notifications/push-service.ts`

```typescript
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: any
) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error('Invalid push token:', pushToken);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', ticket);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
```

#### 3. Trigger Notifications on Events

**Example: Application Status Change**

```typescript
// In src/app/api/v1/admin/applications/[id]/review/route.ts
import { sendPushNotification } from '@/lib/notifications/push-service';

// After updating application status
const user = await db.collection('users').doc(application.userId).get();
if (user.exists && user.data()?.pushToken) {
  await sendPushNotification(
    user.data().pushToken,
    'Application Status Update',
    `Your application has been ${newStatus}`,
    {
      type: 'application_status',
      applicationId: application.referenceId,
      status: newStatus,
    }
  );
}
```

**Example: Event Reminder (1 day before)**

```typescript
// Use a cron job or Cloud Function
// Runs daily at 10:00 AM
export async function sendEventReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // Get events happening tomorrow
  const eventsSnapshot = await db
    .collection('events')
    .where('date', '>=', tomorrow)
    .where('date', '<=', tomorrowEnd)
    .get();

  for (const eventDoc of eventsSnapshot.docs) {
    const event = eventDoc.data();

    // Get all registrations for this event
    const registrationsSnapshot = await eventDoc.ref
      .collection('registrations')
      .get();

    for (const regDoc of registrationsSnapshot.docs) {
      const registration = regDoc.data();

      // Get user's push token
      const userDoc = await db.collection('users').doc(registration.userId).get();
      if (userDoc.exists && userDoc.data()?.pushToken) {
        await sendPushNotification(
          userDoc.data().pushToken,
          'Event Reminder',
          `${event.title} starts tomorrow at ${event.time}`,
          {
            type: 'event_reminder',
            eventId: eventDoc.id,
          }
        );
      }
    }
  }
}
```

### Notification Best Practices

#### 1. Request Permissions Appropriately

- ✅ Request after user logs in (shows value)
- ✅ Explain why notifications are useful
- ❌ Request immediately on app launch
- ❌ Spam users with too many notifications

#### 2. Handle Permission Denial Gracefully

```typescript
const token = await notificationService.registerForPushNotifications();
if (!token) {
  // User denied permissions - app still works
  console.log('Notifications disabled by user');
}
```

#### 3. Provide Settings to Control Notifications

Allow users to:
- Enable/disable notification types
- Set quiet hours
- Control notification frequency

#### 4. Deep Linking

Always include navigation data in notifications:

```typescript
data: {
  type: 'application_status',
  applicationId: 'MLSC-123',
  screen: 'ApplicationDetail',
}
```

#### 5. Badge Management

Clear badges when user views content:

```typescript
// When user opens applications screen
await notificationService.setBadgeCount(0);
```

### Testing Notifications

#### 1. Test Local Notifications

```typescript
// In any screen
import notificationService from '@/services/notifications';

const testNotification = async () => {
  await notificationService.scheduleLocalNotification(
    'Test Notification',
    'This is a test notification',
    {
      type: 'general',
      message: 'Testing...',
    },
    5 // trigger after 5 seconds
  );
};
```

#### 2. Test Remote Notifications

Use Expo Push Tool:
1. Get push token from app logs
2. Visit https://expo.dev/notifications
3. Enter token and message
4. Click "Send Notification"

#### 3. Test Navigation

1. Send notification with specific data
2. Tap notification from lock screen
3. Verify app navigates to correct screen

#### 4. Test Foreground Handling

1. Open the app
2. Send a notification
3. Verify it displays as banner/toast

---

## Troubleshooting

### Offline Support Issues

**Problem:** Data not loading offline

**Solution:**
1. Verify Firestore persistence is enabled in `firebase.ts`
2. Check that data was loaded at least once while online
3. Look for errors in console logs

**Problem:** Mutations not syncing when back online

**Solution:**
1. Firestore automatically handles this
2. Check network connectivity
3. Verify Firebase rules allow writes for authenticated users

### Push Notification Issues

**Problem:** Not receiving notifications

**Solution:**
1. Check device notification permissions: Settings → MLSC App → Notifications
2. Verify push token is generated (check console logs)
3. Test with Expo Push Tool to isolate issue
4. Check backend logs for send errors

**Problem:** Notifications not showing in foreground

**Solution:**
1. Verify `setNotificationHandler` is configured in App.tsx
2. Check `shouldShowAlert: true` is set
3. iOS: Ensure notification permissions include alerts

**Problem:** Navigation not working on tap

**Solution:**
1. Verify `navigationRef` is passed to NavigationContainer
2. Check notification data structure matches expected format
3. Ensure target screens are registered in navigation

**Problem:** "Invalid push token" error

**Solution:**
1. Push tokens only work on physical devices
2. Ensure Expo project ID is set in app.json
3. Rebuild app after changing configuration

---

## Performance Optimization

### Offline Data

1. **Limit Cache Size**
   - Firestore automatically manages cache size
   - Default: 40 MB on mobile
   - Clears oldest data when limit reached

2. **Selective Syncing**
   - Only subscribe to collections you need
   - Unsubscribe when screens unmount

3. **Pagination**
   - Load data in chunks
   - Don't cache entire database

### Push Notifications

1. **Batch Notifications**
   - Don't send multiple notifications rapidly
   - Group related updates into one notification

2. **Rate Limiting**
   - Limit notifications per user per day
   - Respect quiet hours (10 PM - 8 AM)

3. **Token Management**
   - Update tokens only when they change
   - Clean up expired tokens from database

---

## Security Considerations

### Offline Data

- ✅ AsyncStorage is encrypted on iOS automatically
- ✅ Android AsyncStorage is app-sandboxed
- ❌ Don't store sensitive data unencrypted
- ✅ Use Expo SecureStore for tokens and passwords

### Push Notifications

- ✅ Validate push tokens before storing
- ✅ Don't include sensitive data in notification body
- ✅ Use data payload for IDs only, fetch details from API
- ❌ Don't send passwords or tokens in notifications
- ✅ Verify user ownership before sending notifications

---

## Monitoring & Analytics

### Track Offline Usage

```typescript
// In authStore or analytics service
const isOnline = await NetInfo.fetch().then(state => state.isConnected);

analytics.track('screen_view', {
  screen: 'Events',
  connection: isOnline ? 'online' : 'offline',
});
```

### Track Notification Engagement

```typescript
// When notification is received
analytics.track('notification_received', {
  type: data.type,
  timestamp: new Date(),
});

// When notification is tapped
analytics.track('notification_tapped', {
  type: data.type,
  screen: data.screen,
  timestamp: new Date(),
});
```

---

## Future Enhancements

### Offline Support

- [ ] Background sync for queued mutations
- [ ] Conflict resolution for concurrent edits
- [ ] Offline image caching with react-native-fast-image
- [ ] Service worker for API response caching

### Push Notifications

- [ ] Rich notifications with images
- [ ] Action buttons (Accept/Decline)
- [ ] Notification categories and channels
- [ ] Scheduled local notifications for deadlines
- [ ] In-app notification inbox

---

## Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## Contact

For issues or questions about offline support and notifications:
1. Check this documentation
2. Review console logs for errors
3. Test with Expo Push Tool
4. Contact the development team
