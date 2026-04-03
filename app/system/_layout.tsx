import React from "react";

import { Stack } from "expo-router";

export default function SystemLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tiktok" />
      <Stack.Screen name="youtube" />
      <Stack.Screen name="facebook" />
      <Stack.Screen name="threads" />
      <Stack.Screen name="instagram" />
      <Stack.Screen name="documents" />
    </Stack>
  );
}
