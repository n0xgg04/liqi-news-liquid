import { Stack } from "expo-router";
import React from "react";

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
    </Stack>
  );
}
