import React, { useEffect, useMemo } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Text, View } from "react-native";

import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

type SplashScreenProps = {
  message?: string;
  editionText?: string;
  minDurationMs?: number;
};

function useRingRotateStyle(sv: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${sv.value}deg` }],
  }));
}

function useRevealUpStyle(delayMs: number) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      delayMs,
      withTiming(1, { duration: 800, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
    );
  }, [delayMs, v]);

  return useAnimatedStyle(() => {
    const opacity = v.value;
    const ty = interpolate(v.value, [0, 1], [40, 0]);
    return { opacity, transform: [{ translateY: ty }] };
  });
}

function useDotBreathStyle(delayMs: number) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withRepeat(
      withSequence(
        withDelay(
          delayMs,
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        ),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [delayMs, v]);

  return useAnimatedStyle(() => {
    const scale = interpolate(v.value, [0, 1], [0.8, 1.5]);
    const opacity = interpolate(v.value, [0, 1], [0.3, 1]);
    return { transform: [{ scale }], opacity };
  });
}

export default function SplashScreen({
  message = "Inisialisasi sistem enkripsi...",
  editionText = "Edition 2.4.0 • Build 829",
  minDurationMs,
}: SplashScreenProps) {
  const t = useSharedValue(0);
  const progress = useSharedValue(0);

  const delays = useMemo(
    () => ({
      logo: 300,
      title: 600,
      tagline: 800,
      progress: 1100,
      version: 1400,
    }),
    [],
  );

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );

    const progressDuration = Math.max(2800, minDurationMs ?? 0);
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: progressDuration,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [minDurationMs, progress, t]);

  const rayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0.1, 0.25]);
    const scale = interpolate(progress.value, [0, 1], [1.0, 1.15]);
    return { opacity, transform: [{ scale }] };
  });

  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);
  const ring4 = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
    );
    ring2.value = withRepeat(
      withTiming(-360, { duration: 15000, easing: Easing.linear }),
      -1,
    );
    ring3.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1,
    );
    ring4.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
    );
  }, [ring1, ring2, ring3, ring4]);

  const ring1Style = useRingRotateStyle(ring1);
  const ring2Style = useRingRotateStyle(ring2);
  const ring3Style = useRingRotateStyle(ring3);
  const ring4Style = useRingRotateStyle(ring4);

  const shimmerX = useSharedValue(-1);
  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => {
    const tx = interpolate(shimmerX.value, [-1, 1], [-120, 120]);
    return { transform: [{ translateX: tx }, { skewX: "-30deg" }] };
  });

  const logoRevealStyle = useRevealUpStyle(delays.logo);
  const titleRevealStyle = useRevealUpStyle(delays.title);
  const taglineRevealStyle = useRevealUpStyle(delays.tagline);
  const progressRevealStyle = useRevealUpStyle(delays.progress);
  const versionRevealStyle = useRevealUpStyle(delays.version);

  const glowPulse = useSharedValue(0);
  useEffect(() => {
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [glowPulse]);

  const progressGlowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glowPulse.value, [0, 1], [0.35, 0.85]);
    const shadowRadius = interpolate(glowPulse.value, [0, 1], [10, 25]);
    return {
      shadowColor: socialPalette.accent,
      shadowOpacity,
      shadowRadius,
      shadowOffset: { width: 0, height: 0 },
      elevation: 12,
    };
  });

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value * 100))}%`,
  }));

  const dot1 = useDotBreathStyle(0);
  const dot2 = useDotBreathStyle(200);
  const dot3 = useDotBreathStyle(400);

  return (
    <LinearGradient
      colors={[socialPalette.bg, socialPalette.cardFrom]}
      className="flex-1 justify-center items-center overflow-hidden"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
      >
        <Animated.View
          className="h-[600px] w-[600px] rounded-full bg-social-accent/10"
          style={rayStyle}
        />
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View className="mb-12" style={logoRevealStyle}>
          <View className="h-44 w-44 items-center justify-center">
            <Animated.View
              className="absolute h-44 w-44 rounded-full border border-white/5"
              style={ring1Style}
            />
            <Animated.View
              className="absolute h-40 w-40 rounded-full border border-social-accent/10"
              style={ring2Style}
            />
            <Animated.View
              className="absolute h-36 w-36 rounded-full border border-white/10"
              style={ring3Style}
            />
            <Animated.View
              className="absolute h-32 w-32 rounded-full border-2 border-l-transparent border-r-transparent border-t-social-accent/30 border-b-social-accent-end/30"
              style={ring4Style}
            />

            <LinearGradient
              colors={[
                socialPalette.accent,
                socialPalette.accentEnd,
                socialPalette.welcomeAccentEnd,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-24 w-24 items-center justify-center overflow-hidden rounded-[32px]"
              style={{
                shadowColor: socialPalette.accent,
                shadowOpacity: 0.4,
                shadowRadius: 50,
                shadowOffset: { width: 0, height: 0 },
                elevation: 18,
              }}
            >
              <View className="absolute inset-0 bg-white/5" />
              <Animated.View
                pointerEvents="none"
                className="absolute -left-10 h-full w-[60px] bg-white/40 opacity-60"
                style={shimmerStyle}
              />
              <View className="h-full w-full items-center justify-center">
                <IconSymbol name="play.fill" size={34} color="#fff" />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        <View className="items-center gap-3">
          <Animated.View style={titleRevealStyle}>
            <Text className="text-[44px] font-black tracking-[-1.2px] text-white">
              Media
              <Text className="text-social-accent-end">Tools</Text>
            </Text>
          </Animated.View>

          <Animated.View
            className="flex-row items-center justify-center gap-2.5"
            style={taglineRevealStyle}
          >
            <View className="h-px w-6 bg-social-accent/50" />
            <Text className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">
              One Tool. All Social Media.
            </Text>
            <View className="h-px w-6 bg-social-accent/50" />
          </Animated.View>
        </View>
      </View>

      <View className="pb-20 px-12">
        <Animated.View style={progressRevealStyle}>
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <Animated.View
              className="h-full overflow-hidden rounded-full"
              style={[progressGlowStyle, progressFillStyle]}
            >
              <LinearGradient
                colors={[socialPalette.accent, socialPalette.accentEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full w-full"
              />
            </Animated.View>
          </View>

          <View className="items-center gap-3 pt-6">
            <View className="flex-row items-center justify-center gap-3">
              <Animated.View
                className="h-1.5 w-1.5 rounded-full bg-social-accent"
                style={dot1}
              />
              <Animated.View
                className="h-1.5 w-1.5 rounded-full bg-social-accent-end"
                style={dot2}
              />
              <Animated.View
                className="h-1.5 w-1.5 rounded-full bg-social-slate-500"
                style={dot3}
              />
            </View>
            <Text className="text-[9px] font-black uppercase tracking-[3px] text-slate-500">
              {message}
            </Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        className="absolute bottom-10 left-0 right-0 items-center"
        style={versionRevealStyle}
      >
        <View className="rounded-full border border-white/5 bg-white/[0.03] px-4 py-1.5">
          <Text className="text-[8px] font-black uppercase tracking-[4px] text-slate-600">
            {editionText}
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}
