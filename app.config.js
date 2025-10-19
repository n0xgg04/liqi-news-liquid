const packageName = 'com.noxinfinity.nox.liqi.news'
const VERSION = '1.0.0'

export default {
  expo: {
    name: 'Liqi News',
    slug: 'nox-liqi-news',
    version: VERSION,
    orientation: 'portrait',
    scheme: 'nox-liqi-news',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      icon: './assets/icon.icon',
      bundleIdentifier: packageName,
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ['remote-notification'],
      },
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './shared/secrets/GoogleService-Info.plist',
      entitlements: {
        'aps-environment': 'development',
      },
      associatedDomains: ['applinks:noxaov.vn'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: packageName,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST ?? './shared/secrets/google-services.json',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'noxaov.vn',
              pathPrefix: '/liqi_news',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/SF-Pro-Display-Ultralight.otf',
            './assets/fonts/SF-Pro-Display-UltralightItalic.otf',
            './assets/fonts/SF-Pro-Display-Thin.otf',
            './assets/fonts/SF-Pro-Display-ThinItalic.otf',
            './assets/fonts/SF-Pro-Display-Light.otf',
            './assets/fonts/SF-Pro-Display-LightItalic.otf',
            './assets/fonts/SF-Pro-Display-Regular.otf',
            './assets/fonts/SF-Pro-Display-RegularItalic.otf',
            './assets/fonts/SF-Pro-Display-Medium.otf',
            './assets/fonts/SF-Pro-Display-MediumItalic.otf',
            './assets/fonts/SF-Pro-Display-Semibold.otf',
            './assets/fonts/SF-Pro-Display-SemiboldItalic.otf',
            './assets/fonts/SF-Pro-Display-Bold.otf',
            './assets/fonts/SF-Pro-Display-BoldItalic.otf',
            './assets/fonts/SF-Pro-Display-Heavy.otf',
            './assets/fonts/SF-Pro-Display-HeavyItalic.otf',
            './assets/fonts/SF-Pro-Display-Black.otf',
            './assets/fonts/SF-Pro-Display-BlackItalic.otf',
            './assets/fonts/SpaceMono-Regular.ttf',
          ],
        },
      ],
      'expo-web-browser',
      'expo-video',
      [
        '@hot-updater/react-native',
        {
          channel: 'production',
        },
      ],
      'expo-localization',
      'expo-sqlite',
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.207043063139-3mril4bo82bu0a6qe32c5mar9qcn9iv7',
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            buildReactNativeFromSource: true,
          },
        },
      ],
      [
        '@evennit/notifee-expo-plugin',
        {
          iosDeploymentTarget: '15.4',
          apsEnvMode: 'development',
          iosAppGroupId: false,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you change your profile picture.',
          cameraPermission: 'The app accesses your camera to let you change your profile picture.',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'react-native',
          organization: 'liqi-news',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '140be6ed-1ff3-4813-a60a-9ea697cdc474',
      },
    },
  },
}
