import React, { useEffect } from 'react'
import * as amplitude from '@amplitude/analytics-react-native'
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  attachStacktrace: true,
  debug: true,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
})

function AnalysticsProvider({ children }: React.PropsWithChildren) {
  useEffect(() => {
    amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_KEY!, undefined, {
      disableCookies: true,
    })
  }, [])

  return <React.Fragment>{children}</React.Fragment>
}

export default Sentry.wrap(AnalysticsProvider)
