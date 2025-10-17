import { getUpdateSource, HotUpdater } from '@hot-updater/react-native'
import React, { useEffect } from 'react'
import { Alert } from 'react-native'

function HotUpdateProvider({ children }: React.PropsWithChildren) {
  useEffect(() => {
    ;(async () => {
      const updateInfo = await HotUpdater.checkForUpdate({
        source: getUpdateSource(process.env.EXPO_PUBLIC_UPDATE_SERVER!, {
          updateStrategy: 'appVersion',
        }),
      })

      if (updateInfo?.status === 'UPDATE') {
        Alert.prompt('Cập nhật', 'Có bản cập nhật mới, vui lòng khởi động lại ứng dụng', [
          {
            text: 'Khởi động lại',
            onPress: () => {
              HotUpdater.reload()
            },
          },
        ])
      }
    })()
  }, [])

  return <>{children}</>
}

export default HotUpdater.wrap({
  source: getUpdateSource(process.env.EXPO_PUBLIC_UPDATE_SERVER!, {
    updateStrategy: 'appVersion',
  }),
  reloadOnForceUpdate: true,
})(HotUpdateProvider)
