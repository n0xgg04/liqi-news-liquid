import { Stack } from "expo-router";
import React from "react";

export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}
