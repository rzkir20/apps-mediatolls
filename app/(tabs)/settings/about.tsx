import React from "react";

import Constants from "expo-constants";

import { LinearGradient } from "expo-linear-gradient";

import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

import { socialPalette } from "@/lib/pallate";

const BG = socialPalette.bg;

const ACCENT = socialPalette.accent;

export default function SettingsAboutScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const copy = languageData.settingsAbout[language];
  const version =
    Constants.expoConfig?.version ??
    (Constants as any).manifest?.version ??
    "1.0.0";

  const openUrl = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6 flex flex-col gap-6">
          <View className="flex-row items-center gap-3">
            <View className="h-[2px] w-8" style={{ backgroundColor: ACCENT }} />
            <Text className="text-social-accent font-black text-[10px] tracking-[0.2em] uppercase">
              {copy.application}
            </Text>
          </View>

          <View className="items-center text-center mb-1">
            <LinearGradient
              colors={["#ff3d57", "#fb923c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-24 h-24 rounded-[28px] items-center justify-center mb-5"
            >
              <IconSymbol name="download" size={42} color="#fff" />
            </LinearGradient>

            <Text className="text-3xl font-cabinet font-black tracking-tight text-white uppercase">
              Media <Text style={{ color: ACCENT }}>Tools</Text>
            </Text>
            <Text className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase mt-2">
              {copy.tagline}
            </Text>
            <View className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Text className="text-[10px] font-black tracking-[0.2em] text-cyan-300 uppercase">
                Version {version}
              </Text>
            </View>
          </View>

          <View className="rounded-[32px] p-6 border border-white/10 bg-white/[0.03]">
            <Text className="text-center text-sm font-black uppercase tracking-[0.15em] text-white/90 mb-3">
              {copy.aboutTitle}
            </Text>
            <Text className="text-slate-400 text-[13px] leading-relaxed text-center">
              {copy.aboutDescription}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03] items-center">
              <Text className="text-lg font-cabinet font-black text-[#ff3d57]">
                500K+
              </Text>
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {copy.downloads}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03] items-center">
              <Text className="text-lg font-cabinet font-black text-cyan-300">
                100K+
              </Text>
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {copy.active}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03] items-center">
              <Text className="text-lg font-cabinet font-black text-orange-400">
                12+
              </Text>
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {copy.platform}
              </Text>
            </View>
          </View>

          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-cabinet font-black uppercase tracking-[0.15em] text-white">
                {copy.features}
              </Text>
              <View className="flex-row gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <IconSymbol
                    key={idx}
                    name="star.fill"
                    size={14}
                    color="#facc15"
                  />
                ))}
              </View>
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03]">
                <IconSymbol name="zap" size={20} color="#ff3d57" />
                <Text className="text-base font-black text-white mt-2">
                  Super Cepat
                </Text>
                <Text className="text-base text-slate-500 leading-tight mt-1">
                  Server berkecepatan tinggi untuk hasil instan.
                </Text>
              </View>
              <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03]">
                <IconSymbol name="lock" size={20} color="#22d3ee" />
                <Text className="text-base font-black text-white mt-2">
                  100% Aman
                </Text>
                <Text className="text-base text-slate-500 leading-tight mt-1">
                  Data Anda diproses dengan fokus pada privasi pengguna.
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03]">
                <IconSymbol name="quality" size={20} color="#bc1888" />
                <Text className="text-base font-black text-white mt-2">
                  Kualitas HD
                </Text>
                <Text className="text-base text-slate-500 leading-tight mt-1">
                  Mendukung resolusi tinggi sesuai sumber yang tersedia.
                </Text>
              </View>
              <View className="flex-1 rounded-2xl p-4 border border-white/10 bg-white/[0.03]">
                <IconSymbol name="layers" size={20} color="#fb923c" />
                <Text className="text-base font-black text-white mt-2">
                  Multi-Platform
                </Text>
                <Text className="text-base text-slate-500 leading-tight mt-1">
                  Satu alat untuk berbagai platform sosial media.
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-4">
            <View className="rounded-3xl p-5 border border-white/10 bg-white/[0.03]">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-xl bg-slate-800 items-center justify-center">
                  <IconSymbol
                    name="chevron.left.forwardslash.chevron.right"
                    size={22}
                    color="#ff3d57"
                  />
                </View>
                <View className="gap-1">
                  <Text className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {copy.developedBy}
                  </Text>
                  <Text className="text-base font-bold text-white">
                    Rizki Ramadhan
                  </Text>
                </View>
              </View>
            </View>

            <View className="rounded-3xl p-5 border border-white/10 bg-white/[0.03]">
              <Text className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                {copy.credits}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {["React Native", "Expo", "Tailwind RN", "TypeScript"].map(
                  (item) => (
                    <View
                      key={item}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <Text className="text-xs font-bold text-slate-400">
                        {item}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={() => openUrl("mailto:support@mediatools.app")}
              className="h-14 rounded-2xl items-center justify-center"
            >
              <LinearGradient
                colors={["#ff3d57", "#bc1888"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-14 w-full rounded-2xl flex-row items-center justify-center gap-2"
              >
                <IconSymbol name="paperplane.fill" size={18} color="#fff" />
                <Text className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  {copy.contactSupport}
                </Text>
              </LinearGradient>
            </Pressable>

            <View className="flex-row gap-3 mt-3">
              {[
                {
                  key: "ig",
                  icon: "brand.instagram" as const,
                  url: "https://www.instagram.com/rzkir.20",
                },
                {
                  key: "tt",
                  icon: "brand.tiktok" as const,
                  url: "https://www.tiktok.com/@rzkir.20",
                },
                {
                  key: "fb",
                  icon: "brand.facebook" as const,
                  url: "https://www.facebook.com/rizki.ramadhan.419859",
                },
                {
                  key: "web",
                  icon: "brand.web" as const,
                  url: "https://mediatools.biz.id",
                },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => openUrl(item.url)}
                  className="flex-1 h-14 rounded-2xl border border-white/10 bg-white/[0.03] items-center justify-center"
                >
                  <IconSymbol
                    name={item.icon}
                    size={22}
                    color="rgba(255,255,255,0.75)"
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="items-center mt-2 pb-2">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {copy.terms}
              </Text>
              <View className="w-1 h-1 rounded-full bg-slate-700" />
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {copy.privacy}
              </Text>
              <View className="w-1 h-1 rounded-full bg-slate-700" />
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {copy.licenses}
              </Text>
            </View>
            <Text className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
              {"\u00A9"} {copy.copyright}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
