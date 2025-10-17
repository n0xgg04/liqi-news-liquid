import { GlassView } from 'expo-glass-effect'
import Animated from 'react-native-reanimated'
import HStack from '../base/HStack'
import { FlashList } from '@shopify/flash-list'

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView)
const AnimatedHStack = Animated.createAnimatedComponent(HStack)
const AnimatedFlatList = Animated.createAnimatedComponent(FlashList)

export { AnimatedGlassView, AnimatedHStack, AnimatedFlatList }
