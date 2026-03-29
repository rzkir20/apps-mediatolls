import React from "react";

import { Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG = "#05060f";
const ACCENT = "#ff3d57";

export default function DonasiScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: BG, paddingTop: insets.top }}>
      <View className="flex-1 px-6 justify-center items-center">
        <Text className="text-2xl font-extrabold text-white mb-2">
          <Text style={{ color: ACCENT }}>Donasi</Text>
        </Text>
        <Text className="text-slate-500 text-sm text-center">
          Dukung pengembangan Media Tools.
        </Text>
      </View>
    </View>
  );
}
