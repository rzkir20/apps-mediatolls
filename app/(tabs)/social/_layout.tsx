import React, { useCallback, useRef } from "react";

import type { Href } from "expo-router";

import { Stack, usePathname, useRouter } from "expo-router";

import { StyleSheet, Text, View } from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Header } from "@/components/social/Header";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { PLATFORM_TABS, getPlatformTabIndex } from "@/components/ui/helper";

import { socialPalette } from "@/lib/pallate";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

const SOCIAL_TAB_COUNT = PLATFORM_TABS.length;

export default function SocialLayout() {
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const panX = useSharedValue(0);
  const tabIndexSV = useSharedValue(0);

  const idx = getPlatformTabIndex(pathname);
  tabIndexSV.value = idx;
  const prevTab = idx > 0 ? PLATFORM_TABS[idx - 1] : null;
  const nextTab = idx < SOCIAL_TAB_COUNT - 1 ? PLATFORM_TABS[idx + 1] : null;
  const prevLabel = languageData.socialLayout[language].previous;
  const nextLabel = languageData.socialLayout[language].next;

  const navigateBySwipe = useCallback(
    (delta: number) => {
      const i = getPlatformTabIndex(pathnameRef.current);
      const next = i + delta;
      if (next < 0 || next >= PLATFORM_TABS.length) return;
      router.replace(PLATFORM_TABS[next].path as Href);
    },
    [router],
  );

  const leftHintStyle = useAnimatedStyle(() => {
    const t = panX.value;
    const i = tabIndexSV.value;
    if (i <= 0 || t < 8) {
      return { opacity: 0, transform: [{ scale: 0.92 }] };
    }
    const p = Math.min(1, (t - 8) / 72);
    return {
      opacity: p * 0.95,
      transform: [{ scale: 0.92 + 0.08 * p }],
    };
  });

  const rightHintStyle = useAnimatedStyle(() => {
    const t = panX.value;
    const i = tabIndexSV.value;
    if (i >= SOCIAL_TAB_COUNT - 1 || t > -8) {
      return { opacity: 0, transform: [{ scale: 0.92 }] };
    }
    const p = Math.min(1, (-t - 8) / 72);
    return {
      opacity: p * 0.95,
      transform: [{ scale: 0.92 + 0.08 * p }],
    };
  });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-28, 28])
    .failOffsetY([-22, 22])
    .onUpdate((e) => {
      panX.value = e.translationX;
    })
    .onEnd((e) => {
      const { translationX, velocityX } = e;
      const THRESHOLD = 56;
      const VELOCITY = 400;
      if (translationX <= -THRESHOLD || velocityX <= -VELOCITY) {
        runOnJS(navigateBySwipe)(1);
      } else if (translationX >= THRESHOLD || velocityX >= VELOCITY) {
        runOnJS(navigateBySwipe)(-1);
      }
    })
    .onFinalize(() => {
      panX.value = withTiming(0, { duration: 220 });
    });

  return (
    <View className="flex-1 bg-social-bg">
      <Header />
      <GestureDetector gesture={panGesture}>
        <View className="flex-1">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="instagram" />
            <Stack.Screen name="youtube" />
            <Stack.Screen name="facebook" />
            <Stack.Screen name="threads" />
          </Stack>

          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {prevTab ? (
              <Animated.View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.edgeHint, styles.edgeLeft, leftHintStyle]}
              >
                <View className="flex-row items-center gap-2 rounded-2xl border border-white/15 bg-black/55 px-3 py-2.5">
                  <IconSymbol
                    name="arrow.back"
                    size={16}
                    color={socialPalette.accent}
                  />
                  <IconSymbol name={prevTab.icon} size={22} color="#ffffff" />
                  <View>
                    <Text className="text-[9px] font-black uppercase tracking-widest text-white/50">
                      {prevLabel}
                    </Text>
                    <Text
                      className="text-[11px] font-black text-white"
                      numberOfLines={1}
                    >
                      {prevTab.label}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ) : null}

            {nextTab ? (
              <Animated.View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.edgeHint, styles.edgeRight, rightHintStyle]}
              >
                <View className="flex-row items-center gap-2 rounded-2xl border border-white/15 bg-black/55 px-3 py-2.5">
                  <View className="items-end">
                    <Text className="text-[9px] font-black uppercase tracking-widest text-white/50">
                      {nextLabel}
                    </Text>
                    <Text
                      className="text-[11px] font-black text-white"
                      numberOfLines={1}
                    >
                      {nextTab.label}
                    </Text>
                  </View>
                  <IconSymbol name={nextTab.icon} size={22} color="#ffffff" />
                  <IconSymbol
                    name="arrow.forward"
                    size={16}
                    color={socialPalette.accent}
                  />
                </View>
              </Animated.View>
            ) : null}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  edgeHint: {
    position: "absolute",
    top: "36%",
    maxWidth: "78%",
  },
  edgeLeft: {
    left: 10,
  },
  edgeRight: {
    right: 10,
  },
});
