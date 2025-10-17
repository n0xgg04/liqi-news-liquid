import { create } from 'zustand'
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging'

interface NotificationState {
  fcmToken: string | null
  isPermissionGranted: boolean
  isInitialized: boolean
  lastNotification: FirebaseMessagingTypes.RemoteMessage | null
  notificationHistory: FirebaseMessagingTypes.RemoteMessage[]

  setFcmToken: (token: string | null) => void
  setPermissionGranted: (granted: boolean) => void
  setInitialized: (initialized: boolean) => void
  setLastNotification: (notification: FirebaseMessagingTypes.RemoteMessage | null) => void
  addNotificationToHistory: (notification: FirebaseMessagingTypes.RemoteMessage) => void
  clearNotificationHistory: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  fcmToken: null,
  isPermissionGranted: false,
  isInitialized: false,
  lastNotification: null,
  notificationHistory: [],

  setFcmToken: (fcmToken) => set({ fcmToken }),
  setPermissionGranted: (isPermissionGranted) => set({ isPermissionGranted }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setLastNotification: (lastNotification) => set({ lastNotification }),

  addNotificationToHistory: (notification) =>
    set((state) => ({
      notificationHistory: [notification, ...state.notificationHistory].slice(0, 50),
    })),

  clearNotificationHistory: () => set({ notificationHistory: [] }),

  clearAll: () =>
    set({
      fcmToken: null,
      isPermissionGranted: false,
      isInitialized: false,
      lastNotification: null,
      notificationHistory: [],
    }),
}))
