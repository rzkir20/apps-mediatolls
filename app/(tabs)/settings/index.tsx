import React from "react";

import { router } from "expo-router";

import { Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { BottomSheets } from "@/components/BottomSheets";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

import { socialPalette } from "@/lib/pallate";

const BG = socialPalette.bg;

const ACCENT = socialPalette.accent;

const LANGUAGE_OPTIONS = [
  { key: "id", label: languageData.labels.id },
  { key: "en", label: languageData.labels.en },
] as const;

const SETTINGS_CARDS = [
  {
    key: "permissions",
    icon: "settings" as const,
    route: "/(tabs)/settings/permissions" as const,
  },
  {
    key: "language",
    icon: "book" as const,
    route: "/(tabs)/settings/language" as const,
  },
  {
    key: "about",
    icon: "info" as const,
    route: "/(tabs)/settings/about" as const,
  },
  {
    key: "privacy",
    icon: "lock" as const,
    route: "/(tabs)/settings/privacy" as const,
  },
  {
    key: "faqs",
    icon: "search" as const,
    route: "/(tabs)/settings/faqs" as const,
  },
] as const;

export default function SettingsPermissionsScreen() {
  const insets = useSafeAreaInsets();
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = React.useState(false);
  const { language, setLanguage } = useLanguage();
  const copy = languageData.settings[language];

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6 mb-4 flex flex-col gap-6">
          <View className="flex-row items-center gap-3">
            <View className="h-[2px] w-8" style={{ backgroundColor: ACCENT }} />
            <Text className="text-social-accent font-black text-[10px] tracking-[0.2em] uppercase">
              {copy.appPreferences}
            </Text>
          </View>

          <Text className="text-4xl font-cabinet font-extrabold leading-[44px] tracking-tight text-white">
            {copy.settings}
            {"\n"}
            <Text style={{ color: ACCENT }}>{copy.center}</Text>
          </Text>

          <Text className="text-slate-400 text-sm font-medium leading-relaxed">
            {copy.description}
          </Text>
        </View>

        <View className="px-4 flex flex-col gap-4">
          {SETTINGS_CARDS.map((item) => (
            <Pressable
              key={item.key}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4"
              onPress={() => {
                if (item.key === "language") {
                  setIsLanguageSheetOpen(true);
                  return;
                }
                router.push(item.route as never);
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="h-11 w-11 rounded-2xl bg-social-accent/10 items-center justify-center">
                    <IconSymbol name={item.icon} size={22} color={ACCENT} />
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-base font-bold">
                      {copy.cards[item.key].title}
                    </Text>
                    <Text className="text-slate-400 text-xs leading-relaxed mt-1">
                      {item.key === "language"
                        ? `${copy.currentLanguage}: ${
                            language === "id"
                              ? languageData.labels.id
                              : languageData.labels.en
                          }`
                        : copy.cards[item.key].description}
                    </Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={18} color="#94a3b8" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomSheets
        visible={isLanguageSheetOpen}
        onClose={() => setIsLanguageSheetOpen(false)}
        title={copy.selectLanguage}
      >
        <View className="pb-6 gap-2">
          {LANGUAGE_OPTIONS.map((option) => {
            const active = language === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={async () => {
                  await setLanguage(option.key);
                  setIsLanguageSheetOpen(false);
                }}
                className={`rounded-2xl px-4 py-4 border ${
                  active
                    ? "border-social-accent bg-social-accent/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm font-bold ${
                      active ? "text-social-accent" : "text-white"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {active ? (
                    <IconSymbol name="checkmark" size={18} color={ACCENT} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BottomSheets>
    </View>
  );
}
