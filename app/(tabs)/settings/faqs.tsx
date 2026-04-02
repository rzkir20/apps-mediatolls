import React from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLanguage } from "@/context/LanguageContext";
import languageData from "@/lib/language.json";

import { socialPalette } from "@/lib/pallate";

const BG = socialPalette.bg;

const ACCENT = socialPalette.accent;

export default function SettingsFaqsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFaq, setActiveFaq] = React.useState(0);
  const { language } = useLanguage();
  const copy = languageData.faqs[language];
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
          <View className="items-center">
            <LinearGradient
              colors={["#ff3d57", "#bc1888"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-20 h-20 rounded-[28px] items-center justify-center mb-5"
            >
              <IconSymbol name="search" size={34} color="#fff" />
            </LinearGradient>
            <Text className="text-3xl font-cabinet font-black tracking-tight text-white text-center">
              {copy.title} <Text style={{ color: ACCENT }}>{copy.titleAccent}</Text>
            </Text>
            <Text className="text-slate-400 text-sm font-medium mt-2 text-center">
              {copy.subtitle}
            </Text>
          </View>

          <View className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] flex-row items-center gap-3">
            <View className="w-2 h-2 rounded-full bg-cyan-400" />
            <View className="flex-1">
              <Text className="text-base font-black uppercase tracking-[0.2em] text-cyan-300">
                {copy.activeHelpTitle}
              </Text>
              <Text className="text-xs text-slate-500 font-medium">
                {copy.activeHelpDescription}
              </Text>
            </View>
            <IconSymbol name="checkmark" size={18} color="#22d3ee" />
          </View>

          <View>
            <Text className="text-base font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
              {copy.popularQuestions}
            </Text>
            <View className="gap-3">
              {copy.items.map((item, index) => (
                <Pressable
                  key={item.question}
                  onPress={() =>
                    setActiveFaq((prev) => (prev === index ? -1 : index))
                  }
                  className={`rounded-2xl p-5 border border-white/10 bg-white/[0.03] ${
                    index > 1 ? "opacity-85" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-white flex-1 pr-3">
                      {item.question}
                    </Text>
                    <IconSymbol
                      name={activeFaq === index ? "close" : "plus"}
                      size={16}
                      color="#64748b"
                    />
                  </View>
                  {activeFaq === index && (
                    <Text className="text-xs leading-relaxed text-slate-500">
                      {item.answer}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
              {copy.helpCategories}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {copy.categories.map((item) => (
                <View
                  key={item}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]"
                >
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-[28px] p-5 border border-white/10 bg-white/[0.03]">
            <Text className="text-sm font-black text-white mb-2">
              {copy.needMoreHelp}
            </Text>
            <Text className="text-[12px] leading-relaxed text-slate-500 mb-4">
              {copy.needMoreHelpDescription}
            </Text>
            <Pressable
              onPress={() => openUrl("mailto:hallo@rizkiramadhan.web.id")}
              className="h-12 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#ff3d57", "#bc1888"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-12 w-full flex-row items-center justify-center gap-2"
              >
                <IconSymbol name="paperplane.fill" size={16} color="#fff" />
                <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  {copy.contactSupport}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
