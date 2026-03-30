import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useFonts } from "expo-font";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { Stack } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import "../global.css";

import { socialPalette } from "@/lib/pallate";

import { PermissionProvider } from "@/context/PermissionContext";

import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();

const socialBg = socialPalette.bg;

export default function RootLayout() {
  const [materialIconsLoaded] = useFonts(MaterialIcons.font);
  const startedAtMsRef = useRef<number>(Date.now());
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const MIN_SPLASH_MS = 3200;
    const elapsed = Date.now() - startedAtMsRef.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    const t = setTimeout(() => setMinSplashElapsed(true), remaining);
    return () => clearTimeout(t);
  }, []);

  if (!materialIconsLoaded || !minSplashElapsed) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: socialBg }}>
        <SplashScreen minDurationMs={3200} />
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
