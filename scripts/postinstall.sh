if [[ "$(uname)" == "Darwin" ]]; then
    echo "Using Mac -i '' seperator for sed -i"
    SP=" " # Needed for portability with sed
else
    echo "Using unix -i separator for sed."
    SP=""
fi
find ./node_modules/react-native-reanimated-skeleton -type f -exec sed -i${SP}'' -e 's/import LinearGradient/import { LinearGradient }/g' -e 's/react-native-linear-gradient/expo-linear-gradient/g' {} +