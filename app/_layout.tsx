import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(public)">
      <Stack.Screen name="(public)" />
      <Stack.Protected guard>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  );
}
