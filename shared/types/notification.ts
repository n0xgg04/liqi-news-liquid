export interface NotificationAction {
  click: {
    screen: string
  }
}

export interface NotificationData {
  title: string
  body: string
  action?: NotificationAction
}

export interface NotificationPayload {
  title: string
  body: string
  data?: any
  action?: NotificationAction
}
