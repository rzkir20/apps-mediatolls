import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useFonts } from "expo-font";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { Stack } from "expo-router";

import React from "react";

import { View } from "react-native";

import "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import "../global.css";

import { socialPalette } from "@/lib/pallate";

import { PermissionProvider } from "@/context/PermissionContext";

const queryClient = new QueryClient();

const socialBg = socialPalette.bg;

export default function RootLayout() {
  const [materialIconsLoaded] = useFonts(MaterialIcons.font);

  if (!materialIconsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: socialBg }}>
        <View style={{ flex: 1, backgroundColor: socialBg }} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PermissionProvider>
          <SafeAreaProvider>
            <ThemeProvider value={DefaultTheme}>
              <SafeAreaView style={{ flex: 1, backgroundColor: socialBg }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: socialBg },
                  }}
                >
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="welcome/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="permission/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </SafeAreaView>
            </ThemeProvider>
          </SafeAreaProvider>
        </PermissionProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
