import React, { useEffect, useMemo, useRef } from "react";

import { Animated, Easing, Text, View } from "react-native";

import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { IconSymbol } from "@/components/ui/icon-symbol";

type LoadingMediaPlayerProps = {
  /** 0..100 */
  progressPercent?: number;
  statusText?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function normalizePercent(n: number) {
  if (!Number.isFinite(n)) return 0;
  // Sync with tiktok.service progress style:
  // use integer percentage in range 0..100.
  const raw = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export default function LoadingMediaPlayer({
  progressPercent = 68,
  statusText = "Memuat media...",
}: LoadingMediaPlayerProps) {
  const BG_DARK = "#05060f";
  const PRIMARY = "#ff3d57";
  const ACCENT_ORANGE = "#fb923c";

  const pct = normalizePercent(progressPercent);
  const progress01 = pct / 100;

  const radius = 70;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  const targetDashOffset = useMemo(() => {
    return circumference * (1 - progress01);
  }, [circumference, progress01]);

  const ringSlow = useRef(new Animated.Value(0)).current;
  const ringReverse = useRef(new Animated.Value(0)).current;
  const iconSpin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dashOffset = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    const slow = Animated.loop(
      Animated.timing(ringSlow, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const reverse = Animated.loop(
      Animated.timing(ringReverse, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const icon = Animated.loop(
      Animated.timing(iconSpin, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    slow.start();
    reverse.start();
    icon.start();
    pulsing.start();

    return () => {
      slow.stop();
      reverse.stop();
      icon.stop();
      pulsing.stop();
    };
  }, [iconSpin, pulse, ringReverse, ringSlow]);

  useEffect(() => {
    dashOffset.stopAnimation();
    Animated.timing(dashOffset, {
      toValue: targetDashOffset,
      duration: 450,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [circumference, dashOffset, targetDashOffset]);

  const slowRotate = ringSlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const reverseRotate = ringReverse.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });
  const iconRotate = iconSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View
      className="w-full h-full items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: BG_DARK }}
    >
      <View className="relative items-center justify-center mb-16">
        <Animated.View
          className="absolute rounded-full"
          style={{
            width: 256,
            height: 256,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.03)",
            transform: [{ rotate: slowRotate }],
          }}
        />

        <Animated.View
          className="absolute rounded-full"
          style={{
            width: 224,
            height: 224,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "rgba(255,61,87,0.10)",
            transform: [{ rotate: reverseRotate }],
          }}
        />

        <Svg width={192} height={192} viewBox="0 0 192 192">
          <Circle
            cx="96"
            cy="96"
            r={radius}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="4"
            fill="transparent"
          />

          <Defs>
            <LinearGradient
              id="loadingGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor={PRIMARY}
                stopOpacity={1}
              />
              <Stop offset="100%" stopColor={ACCENT_ORANGE} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          <AnimatedCircle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#loadingGrad)"
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 96 96)"
          />
        </Svg>

        <View className="absolute items-center justify-center">
          <Animated.View
            className="w-14 h-14 rounded-full items-center justify-center mb-4"
            style={{
              backgroundColor: "rgba(255,61,87,0.05)",
              opacity: 0.8,
              transform: [{ rotate: iconRotate }],
            }}
          >
            <IconSymbol name="play" size={22} color={PRIMARY} />
          </Animated.View>

          <View className="items-center">
            <Text className="text-white text-4xl font-extrabold tracking-tighter">
              {Math.round(pct)}
              <Text className="text-white/40 text-xl font-medium">%</Text>
            </Text>
          </View>
        </View>
      </View>

      <Animated.View style={{ opacity: pulseOpacity }}>
        <Text className="text-[11px] font-black uppercase tracking-[6px] text-[#ff3d57]/80 text-center">
          {statusText}
        </Text>
      </Animated.View>
    </View>
  );
}
