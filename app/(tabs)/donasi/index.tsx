import React, { useState } from "react";

import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";

import { Pressable, ScrollView, Text, View } from "react-native";

import gopay from "@/assets/images/gopay.jpeg";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { DialogDonasi } from "@/components/ui/dialog-donasi";

import { socialPalette } from "@/lib/pallate";

import { DonasiHeader } from "@/components/donasi/Header";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

export default function DonasiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarOffset = 88 + insets.bottom;
  const [guideVisible, setGuideVisible] = useState(false);
  const { language } = useLanguage();
  const copy = languageData.donasi[language];

  return (
    <View className="flex-1 bg-social-bg">
      <DonasiHeader />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: tabBarOffset,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-8 items-center">
          <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <IconSymbol
              name="heart.fill"
              size={14}
              color={socialPalette.accent}
            />
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-social-accent">
              {copy.supportCreativity}
            </Text>
          </View>

          <Text className="text-center text-4xl leading-tight font-extrabold text-white">
            {copy.keepFree}
            {"\n"}
            <Text className="text-social-accent">{copy.forever}</Text>
          </Text>
          <Text className="text-center text-social-slate-500 text-sm leading-6 mt-4 max-w-[330px]">
            {copy.subtitle}
          </Text>
        </View>

        <View className="px-6 mb-10 items-center">
          <Text className="text-2xl font-extrabold text-white mb-5">
            {copy.payment} <Text className="text-social-accent">QRIS</Text>
          </Text>
          <View
            className="p-6 rounded-[34px] border"
            style={{
              borderColor: socialPalette.accentGlowMidStrong,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <View className="w-full relative aspect-square rounded-3xl">
              <Image
                source={gopay}
                contentFit="contain"
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            <Text className="mt-5 text-base text-social-slate-500 text-center max-w-[230px] mx-auto">
              {copy.scanText}
            </Text>
          </View>
        </View>

        <View className="px-6 mb-10">
          <Pressable
            onPress={() => setGuideVisible(true)}
            className="rounded-[28px] border border-white/10 bg-white/5 overflow-hidden active:opacity-90"
          >
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View className="w-11 h-11 rounded-2xl items-center justify-center border border-white/10 bg-white/5">
                  <IconSymbol
                    name="doc.text"
                    size={22}
                    color={socialPalette.accent}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-social-accent text-[11px] font-black uppercase tracking-[0.2em] mb-1">
                    {copy.transferGuide}
                  </Text>
                  <Text className="text-white text-sm font-bold">
                    {copy.bankWallet}
                  </Text>
                  <Text className="text-social-slate-500 text-xs mt-1 leading-5">
                    {copy.transferDesc}
                  </Text>
                </View>
              </View>
              <IconSymbol
                name="chevron.right"
                size={22}
                color={socialPalette.accent}
              />
            </View>
          </Pressable>
        </View>

        <View className="px-6 mb-10">
          <View className="rounded-[32px] border border-white/10 bg-white/5 overflow-hidden">
            <LinearGradient
              colors={[
                socialPalette.accent,
                socialPalette.accentEnd,
                socialPalette.bg,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 3,
                height: "100%",
              }}
            />
            <View className="p-6">
              <Text className="text-2xl text-white font-extrabold mb-6">
                {copy.fundTitle1}
                {"\n"}
                <Text className="text-social-accent">{copy.fundTitle2}</Text>
              </Text>
              <View className="flex flex-col gap-4">
                {copy.fundUsage.map((item) => (
                  <View key={item.title} className="flex-row items-start gap-3">
                    <View className="w-5 h-5 mt-0.5 rounded-full bg-social-accent-faint items-center justify-center">
                      <IconSymbol
                        name="checkmark"
                        size={12}
                        color={socialPalette.accent}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-bold">
                        {item.title}
                      </Text>
                      <Text className="text-social-slate-500 text-xs mt-0.5">
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="px-6">
          <View className="rounded-[36px] border border-white/10 overflow-hidden">
            <LinearGradient
              colors={[
                socialPalette.accentGlowStrong,
                socialPalette.accentGlowFade,
                socialPalette.accentGlowMidSoft,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 34,
                alignItems: "center",
              }}
            >
              <IconSymbol
                name="star.fill"
                size={46}
                color={socialPalette.accent}
              />
              <Text className="text-center text-3xl font-extrabold text-white mt-6">
                {copy.hero1}
                {"\n"}
                <Text className="text-social-accent">{copy.hero2}</Text>
              </Text>
              <Text className="text-center text-social-slate-500 text-sm leading-6 mt-4 mb-8 max-w-[240px]">
                {copy.heroDesc}
              </Text>
              <Pressable
                className="w-full rounded-3xl overflow-hidden active:opacity-90"
                onPress={() => router.push("/testimonials")}
              >
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-white font-black uppercase tracking-[0.25em] text-[11px]">
                    {copy.seeTestimonials}
                  </Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <DialogDonasi
        visible={guideVisible}
        onRequestClose={() => setGuideVisible(false)}
      />
    </View>
  );
}
