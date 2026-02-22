import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { lightTheme } from './src/theme/theme';
import RootNavigator from './src/navigation/RootNavigator';
import notificationService, { NotificationData } from './src/services/notifications';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Register for push notifications when app loads
    if (isAuthenticated) {
      registerForNotifications();
    }

    // Setup notification listeners
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Notification received while app is in foreground
        // The notification will be displayed automatically
      }
    );

    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        handleNotificationTap(response.notification);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  const registerForNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        console.log('Push token registered:', token);
        // TODO: Send token to backend to store in user profile
        // This would allow backend to send targeted notifications
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  const handleNotificationTap = (notification: Notifications.Notification) => {
    const data = notification.request.content.data as NotificationData;

    if (!navigationRef.current?.isReady()) {
      return;
    }

    // Navigate based on notification type
    switch (data.type) {
      case 'application_status':
        if (data.applicationId) {
          // Navigate to application status screen
          navigationRef.current?.navigate('User', {
            screen: 'Apply',
            params: {
              referenceId: data.applicationId,
            },
          });
        }
        break;

      case 'event_reminder':
        if (data.eventId) {
          // Navigate to event detail screen
          navigationRef.current?.navigate('User', {
            screen: 'Events',
            params: {
              screen: 'EventDetail',
              params: { eventId: data.eventId },
            },
          });
        }
        break;

      default:
        // For general notifications, just open the app
        break;
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
