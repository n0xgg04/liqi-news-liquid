import { Slot } from 'expo-router'
import React from 'react'
import { HotUpdater, getUpdateSource } from '@hot-updater/react-native'
import { AuthProvider, NotificationProvider } from '@/shared/providers'
import TanstackQueryProvider from '@/shared/providers/TanstackQueryProvider'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import AnalysticsProvider from '@/shared/providers/AnalysticsProvider'

import './global.css'
import HotUpdateProvider from '@/shared/providers/HotUpdate'

function RootLayout() {
  return (
    <HotUpdateProvider>
      <AnalysticsProvider>
        <KeyboardProvider>
          <TanstackQueryProvider>
            <AuthProvider>
              <NotificationProvider>
                <Slot />
              </NotificationProvider>
            </AuthProvider>
          </TanstackQueryProvider>
        </KeyboardProvider>
      </AnalysticsProvider>
    </HotUpdateProvider>
  )
}

export default RootLayout
