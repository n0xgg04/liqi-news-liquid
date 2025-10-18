import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import notifee, { EventType, Event } from '@notifee/react-native'
import { Platform, AppState, AppStateStatus } from 'react-native'
import { router, SplashScreen } from 'expo-router'
import { useNotificationStore } from '../stores/notification-store'
import { supabase } from '../libs/supabase'
import { getUniqueId } from 'react-native-device-info'
import { useAuth } from './AuthProvider'
;(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true

SplashScreen.preventAutoHideAsync()

interface NotificationAction {
  click: {
    screen: string
  }
}

interface NotificationData {
  title: string
  body: string
  screen?: string
}

interface NotificationContextType {
  fcmToken: string | null
  isPermissionGranted: boolean
  isInitialized: boolean
  lastNotification: FirebaseMessagingTypes.RemoteMessage | null
  notificationHistory: FirebaseMessagingTypes.RemoteMessage[]

  requestPermission: () => Promise<boolean>
  getFCMToken: () => Promise<string | null>
  subscribeToTopic: (topic: string) => Promise<void>
  unsubscribeFromTopic: (topic: string) => Promise<void>
  clearNotificationHistory: () => void
  displayLocalNotification: (title: string, body: string, data?: any) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const {
    fcmToken,
    isPermissionGranted,
    isInitialized,
    lastNotification,
    notificationHistory,
    setFcmToken,
    setPermissionGranted,
    setInitialized,
    setLastNotification,
    addNotificationToHistory,
    clearNotificationHistory: clearStoreHistory,
  } = useNotificationStore()
  const { user, isLoading } = useAuth()

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission({
          alert: true,
          announcement: false,
          badge: true,
          carPlay: false,
          criticalAlert: false,
          provisional: false,
          sound: true,
        })

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        setPermissionGranted(enabled)
        return enabled
      } else {
        const authStatus = await messaging().requestPermission()
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
        setPermissionGranted(enabled)
        return enabled
      }
    } catch (error) {
      console.error('Permission request error:', error)
      return false
    }
  }, [setPermissionGranted])

  const getFCMToken = useCallback(async (): Promise<string | null> => {
    if (isLoading) return null
    try {
      const token = await messaging().getToken()
      setFcmToken(token)
      if (token) {
        const deviceId = await getUniqueId()
        await supabase.functions.invoke('register-firebase-token', {
          body: { token, device_id: deviceId, user_id: user?.id ?? null },
        })
      }
      return token
    } catch (error) {
      console.error('Get FCM token error:', error)
      return null
    }
  }, [setFcmToken, user?.id, isLoading])

  const onTokenRefresh = useCallback(async () => {
    try {
      const token = await messaging().getToken()
      setFcmToken(token)
    } catch (error) {
      console.error('Token refresh error:', error)
    }
  }, [setFcmToken])

  const setupBackgroundMessageHandler = useCallback(() => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage)

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Background Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        data: remoteMessage.data,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      })
    })
  }, [])

  const setupNotifee = useCallback(async () => {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: 4,
    })
  }, [])

  const onForegroundMessage = useCallback(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground message received:', remoteMessage)

      setLastNotification(remoteMessage)
      addNotificationToHistory(remoteMessage)

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Foreground Notification',
        body: remoteMessage.notification?.body || 'You have a new message',
        data: remoteMessage.data,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      })
    },
    [setLastNotification, addNotificationToHistory]
  )

  const handleNotificationPress = useCallback((notification: any) => {
    if (notification?.data) {
      console.log('Notification data:', notification.data)

      try {
        const data: NotificationData = notification.data

        if (data?.screen) {
          const route = data.screen
          console.log('Navigating to:', route)
          router.push(route as any)
        }
      } catch (error) {
        console.error('Error parsing notification data:', error)

        if (notification.data?.screen) {
          const route = notification.data.screen
          console.log('Navigating to:', route)
          router.push(route as any)
        }
      }
    }
  }, [])

  const handleNotifeeEvent = useCallback(
    ({ type, detail }: Event) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('Notification dismissed:', detail.notification)
          break
        case EventType.PRESS:
          console.log('Notification pressed:', detail.notification)
          handleNotificationPress(detail.notification)
          break
      }
    },
    [handleNotificationPress]
  )

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage) {
              console.log('App opened from notification:', remoteMessage)
              setLastNotification(remoteMessage)
              addNotificationToHistory(remoteMessage)
              handleNotificationPress({ data: remoteMessage.data })
            }
          })
      }
    },
    [setLastNotification, addNotificationToHistory, handleNotificationPress]
  )

  const initializeNotifications = useCallback(async () => {
    try {
      await requestPermission()
      await getFCMToken()
      setupBackgroundMessageHandler()
      await setupNotifee()
      setInitialized(true)
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
    }
  }, [requestPermission, getFCMToken, setupBackgroundMessageHandler, setupNotifee, setInitialized])

  useEffect(() => {
    const unsubscribe = messaging().onMessage(onForegroundMessage)
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(onTokenRefresh)

    const unsubscribeNotifee = notifee.onForegroundEvent(handleNotifeeEvent)
    initializeNotifications()

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage)
          setLastNotification(remoteMessage)
          addNotificationToHistory(remoteMessage)
          handleNotificationPress({ data: remoteMessage.data })
        }
      })

    SplashScreen.hideAsync()

    return () => {
      unsubscribe()
      unsubscribeTokenRefresh()
      unsubscribeNotifee()
      appStateSubscription?.remove()
    }
  }, [
    initializeNotifications,
    onForegroundMessage,
    onTokenRefresh,
    handleNotifeeEvent,
    handleAppStateChange,
  ])

  const subscribeToTopic = async (topic: string): Promise<void> => {
    try {
      await messaging().subscribeToTopic(topic)
      console.log(`Subscribed to topic: ${topic}`)
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error)
    }
  }

  const unsubscribeFromTopic = async (topic: string): Promise<void> => {
    try {
      await messaging().unsubscribeFromTopic(topic)
      console.log(`Unsubscribed from topic: ${topic}`)
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error)
    }
  }

  const clearNotificationHistory = () => {
    clearStoreHistory()
  }

  const parseNotificationData = useCallback((data: any): NotificationData | null => {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data)
      }
      return data as NotificationData
    } catch (error) {
      console.error('Error parsing notification data:', error)
      return null
    }
  }, [])

  const displayLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    action?: NotificationAction
  ): Promise<void> => {
    try {
      const notificationData = action ? { title, body, screen } : data

      await notifee.displayNotification({
        title,
        body,
        data: notificationData,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      })
    } catch (error) {
      console.error('Failed to display local notification:', error)
    }
  }

  const value: NotificationContextType = {
    fcmToken,
    isPermissionGranted,
    isInitialized,
    lastNotification,
    notificationHistory,
    requestPermission,
    getFCMToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    clearNotificationHistory,
    displayLocalNotification,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
