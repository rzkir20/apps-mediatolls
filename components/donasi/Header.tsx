import { LinearGradient } from "expo-linear-gradient";

import { Pressable, Text, View, type ViewStyle } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

export function DonasiHeader({
  title = "DONASI | MEDIA TOOLS",
  onPressProfile,
}: SocialHeaderProps) {
  const logoStyle: ViewStyle = {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: socialPalette.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  };

  return (
    <View className="px-4 pt-4 flex-row items-center justify-between w-full">
      <View className="flex-row items-center gap-2">
        <LinearGradient
          colors={[socialPalette.accent, socialPalette.accentEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={logoStyle}
        >
          <IconSymbol name="play.fill" size={20} color="#fff" />
        </LinearGradient>

        <Text className="text-xl font-extrabold tracking-tight text-white">
          {title}
        </Text>
      </View>

      <Pressable
        onPress={onPressProfile}
        className="w-10 h-10 rounded-full border border-white/10 items-center justify-center bg-white/5 active:opacity-80"
      >
        <IconSymbol
          name="person.circle"
          size={22}
          color="rgba(255,255,255,0.7)"
        />
      </Pressable>
    </View>
  );
}
