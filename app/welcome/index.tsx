import AsyncStorage from "@react-native-async-storage/async-storage";

import { Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter";

import {
  useFonts,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import React, { useEffect, useRef, useState } from "react";

import { Animated, Pressable, Text, View } from "react-native";

import AnimatedReanimated, {
  Easing,
  FadeInRight,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { STORAGE_KEY_WELCOME_COMPLETED } from "@/lib/config";

import { socialPalette } from "@/lib/pallate";

type FeatureRow = {
  title: string;
  subtitle: string;
  icon: (props: { size: number; color: string }) => React.ReactNode;
};

type SlideDef = {
  headerIcon: (props: { size: number; color: string }) => React.ReactNode;
  headerIconVariant: "gradient" | "bordered";
  titleLine1: string;
  titleLine2Accent: string;
  features: FeatureRow[];
};

const slides: SlideDef[] = [
  {
    headerIcon: ({ size, color }) => (
      <Ionicons
        name="play"
        size={size}
        color={color}
        style={{ marginLeft: 4 }}
      />
    ),
    headerIconVariant: "gradient",
    titleLine1: "Download",
    titleLine2Accent: "Multi-Platform",
    features: [
      {
        title: "TikTok",
        subtitle: "Download videos without watermark",
        icon: ({ size, color }) => (
          <Ionicons name="musical-notes" size={size} color={color} />
        ),
      },
      {
        title: "Instagram",
        subtitle: "Photos & videos in HD",
        icon: ({ size, color }) => (
          <Ionicons name="image-outline" size={size} color={color} />
        ),
      },
      {
        title: "Facebook",
        subtitle: "Videos from any source",
        icon: ({ size, color }) => (
          <Ionicons name="videocam-outline" size={size} color={color} />
        ),
      },
    ],
  },
  {
    headerIcon: ({ size, color }) => (
      <Ionicons name="cloud-download-outline" size={size} color={color} />
    ),
    headerIconVariant: "bordered",
    titleLine1: "Save Files",
    titleLine2Accent: "Locally",
    features: [
      {
        title: "Organize by Platform",
        subtitle: "Auto-sort downloads",
        icon: ({ size, color }) => (
          <Ionicons name="folder-outline" size={size} color={color} />
        ),
      },
      {
        title: "Offline Viewing",
        subtitle: "Watch anytime anywhere",
        icon: ({ size, color }) => (
          <MaterialCommunityIcons name="wifi-off" size={size} color={color} />
        ),
      },
      {
        title: "Auto Backup",
        subtitle: "Never lose your files",
        icon: ({ size, color }) => (
          <Ionicons name="shield-checkmark-outline" size={size} color={color} />
        ),
      },
    ],
  },
  {
    headerIcon: ({ size, color }) => (
      <Ionicons name="flash" size={size} color={color} />
    ),
    headerIconVariant: "bordered",
    titleLine1: "Fast &",
    titleLine2Accent: "Reliable",
    features: [
      {
        title: "High Speed Download",
        subtitle: "Lightning fast servers",
        icon: ({ size, color }) => (
          <Ionicons name="flash" size={size} color={color} />
        ),
      },
      {
        title: "Multiple Formats",
        subtitle: "Choose your quality",
        icon: ({ size, color }) => (
          <Ionicons name="layers-outline" size={size} color={color} />
        ),
      },
      {
        title: "24/7 Support",
        subtitle: "Always here to help",
        icon: ({ size, color }) => (
          <Ionicons name="headset-outline" size={size} color={color} />
        ),
      },
    ],
  },
];

function FeatureCard({ item }: { item: FeatureRow }) {
  return (
    <View className="flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/6">
        {item.icon({ size: 24, color: socialPalette.accent })}
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-sans-bold text-base text-white">
          {item.title}
        </Text>
        <Text className="font-sans text-xs font-medium text-slate-400">
          {item.subtitle}
        </Text>
      </View>
    </View>
  );
}

export default function WelcomeOnboarding() {
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;
  const floatY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_700Bold,
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatY]);

  const completeWelcome = async () => {
    await AsyncStorage.setItem(STORAGE_KEY_WELCOME_COMPLETED, "true");
    router.replace("/(tabs)/social");
  };

  const goNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      void completeWelcome();
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) setCurrentSlide((s) => s - 1);
  };

  const slide = slides[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;
  const navLabel = isLast ? "Get Started" : "Next";

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View className="flex-1 overflow-hidden bg-welcome">
      <View
        pointerEvents="none"
        className="absolute -right-20 -top-20 z-0 h-64 w-64 overflow-hidden rounded-full opacity-65"
      >
        <LinearGradient
          colors={[
            socialPalette.accentGlowStrong,
            socialPalette.accentGlowMidStrong,
            socialPalette.accentGlowFade,
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.15, y: 0.15 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 256, height: 256, borderRadius: 128 }}
        />
      </View>
      <View
        pointerEvents="none"
        className="absolute -left-32 top-1/2 z-0 h-80 w-80 overflow-hidden rounded-full opacity-[0.65]"
      >
        <LinearGradient
          colors={[
            socialPalette.accentGlowSoft,
            socialPalette.accentGlowMidSoft,
            socialPalette.accentGlowFade,
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 320, height: 320, borderRadius: 160 }}
        />
      </View>

      <View className="z-10 flex-1 flex-col">
        <AnimatedReanimated.View
          key={currentSlide}
          entering={FadeInRight.duration(400).easing(
            Easing.bezier(0.4, 0, 0.2, 1),
          )}
          className="flex-1 flex-col"
        >
          <View
            className="z-10 shrink-0 flex-col items-center px-8 pt-14"
            style={{ paddingTop: insets.top + 56 }}
          >
            {slide.headerIconVariant === "gradient" ? (
              <Animated.View
                className="mb-6"
                style={{ transform: [{ translateY: floatY }] }}
              >
                <View className="h-12 w-12 overflow-hidden rounded-2xl shadow-lg shadow-brand/12 elevation-6">
                  <LinearGradient
                    colors={[
                      socialPalette.accent,
                      socialPalette.welcomeAccentEnd,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {slide.headerIcon({ size: 24, color: "#ffffff" })}
                  </LinearGradient>
                </View>
              </Animated.View>
            ) : (
              <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                {slide.headerIcon({ size: 24, color: socialPalette.accent })}
              </View>
            )}

            <View className="items-center">
              <Text className="text-center font-cabinet text-2xl uppercase leading-none tracking-tight text-white">
                {slide.titleLine1}
                {"\n"}
                <Text className="font-cabinet text-2xl uppercase leading-none tracking-tight text-brand-highlight">
                  {slide.titleLine2Accent}
                </Text>
              </Text>
            </View>
          </View>

          <View className="z-10 flex-1 flex-col items-center gap-4 px-8 py-6">
            <View className="w-full gap-4">
              {slide.features.map((f) => (
                <FeatureCard key={f.title} item={f} />
              ))}
            </View>
          </View>
        </AnimatedReanimated.View>

        <View
          className="z-10 shrink-0 flex-col items-center gap-6 px-8"
          style={{ paddingBottom: insets.bottom + 34 }}
        >
          <View className="flex-row items-center gap-2">
            {slides.map((_, i) => (
              <View
                key={i}
                className={`h-2 w-2 rounded-full ${i === currentSlide ? "bg-brand" : "bg-white/10"}`}
              />
            ))}
          </View>

          <View className="w-full flex-row items-center gap-4">
            {!isFirst ? (
              <Pressable
                onPress={goPrev}
                className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 active:scale-[0.96] active:opacity-[0.92]"
              >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
              </Pressable>
            ) : null}

            <Pressable
              onPress={goNext}
              className="min-w-0 flex-1 active:scale-[0.96] active:opacity-[0.92]"
            >
              <LinearGradient
                colors={[socialPalette.accent, socialPalette.welcomeAccentEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  shadowColor: socialPalette.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.16,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <Text className="text-center font-cabinet text-sm font-extrabold uppercase tracking-widest text-white">
                  {navLabel}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable onPress={() => void completeWelcome()}>
            <Text className="font-sans-bold text-xs font-bold uppercase tracking-widest text-slate-500">
              Skip for now
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
