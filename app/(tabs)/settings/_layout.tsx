import React from "react";

import { Stack } from "expo-router";

import { View } from "react-native";

import { DonasiHeader } from "@/components/donasi/Header";

export default function AnimeLayout() {
  return (
    <View className="flex-1 bg-social-bg">
      <DonasiHeader />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="permissions" />
        <Stack.Screen name="about" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="faqs" />
      </Stack>
    </View>
  );
}
