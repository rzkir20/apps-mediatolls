import { LinearGradient } from "expo-linear-gradient";

import { usePathname, useRouter } from "expo-router";

import {
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

import { PLATFORM_TABS, isPlatformActive } from "@/components/ui/helper";

export function Header({
  title = "MEDIA TOOLS",
  onPressProfile,
}: SocialHeaderProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";

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
    <View className="px-4 pt-4 pb-3">
      <View className="flex-row items-center justify-between pb-3">
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: "row",
          gap: 12,
          paddingVertical: 4,
          paddingBottom: 4,
        }}
      >
        {PLATFORM_TABS.map((tab) => {
          const active = isPlatformActive(pathname, tab.id);
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => router.replace(tab.path)}
              style={
                active
                  ? {
                      backgroundColor: socialPalette.accent,
                      shadowColor: socialPalette.accent,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                      elevation: 6,
                    }
                  : undefined
              }
              className={`shrink-0 flex-row items-center gap-2 rounded-full border px-4 py-2 ${
                active ? "border-transparent" : "border-white/10 bg-transparent"
              } active:opacity-90`}
            >
              <IconSymbol
                name={tab.icon}
                size={16}
                color={active ? "#ffffff" : socialPalette.slate500}
              />
              <Text
                className={`text-xs font-bold ${
                  active ? "text-white" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
