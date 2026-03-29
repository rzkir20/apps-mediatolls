import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import * as Haptics from "expo-haptics";

import React from "react";

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG = "#05060f";
const ACCENT = "#ff3d57";
const MUTED = "#64748b";

export function NavigationTabs({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const handlePress = (route: { key: string; name: string }, isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
      <View style={styles.content} className="border-t border-white/5">
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const isFocused = state.index === index;
            const color = isFocused ? ACCENT : MUTED;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handlePress(route, isFocused)}
                className="flex-1 items-center justify-center gap-1 py-1"
                activeOpacity={0.75}
              >
                {options.tabBarIcon && (
                  <View className="items-center justify-center">
                    {options.tabBarIcon({
                      focused: isFocused,
                      color,
                      size: 24,
                    })}
                  </View>
                )}
                <Text
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    backgroundColor: BG,
  },
  content: {
    backgroundColor: BG,
  },
});
