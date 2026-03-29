import React from "react";

import { Stack } from "expo-router";

import { View } from "react-native";

import { Header } from "@/components/social/Header";

export default function AnimeLayout() {
  return (
    <View className="flex-1 bg-social-bg">
      <Header />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="instagram" />
        <Stack.Screen name="youtube" />
        <Stack.Screen name="facebook" />
      </Stack>
    </View>
  );
}
