import React, { useState } from "react";

import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import type { IconSymbolName } from "@/components/ui/icon-symbol";

import { DialogDonasi } from "@/components/ui/dialog-donasi";

import { DONATION_PRESETS, type DonationPresetId } from "@/lib/data";

import { socialPalette } from "@/lib/pallate";

import { DonasiHeader } from "@/components/donasi/Header";

const PRESET_ICON: Record<DonationPresetId, IconSymbolName> = {
  "20k": "cup.and.saucer",
  "50k": "dns",
  "100k": "sparkles",
  "200k": "timeline",
  "500k": "calendar",
  custom: "plus",
};

const HIGHLIGHT_PRESET_ID: DonationPresetId = "100k";

const FUND_USAGE = [
  {
    title: "Biaya Server",
    desc: "Menjaga kestabilan server download 24/7.",
  },
  {
    title: "Pengembangan",
    desc: "Fitur baru & perbaikan bug setiap minggu.",
  },
  {
    title: "Pemeliharaan API",
    desc: "Update rutin untuk semua media sosial.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      '"Tool yang luar biasa! Sangat membantu pekerjaan konten kreator saya setiap hari."',
    name: "Bagus Satria",
    role: "Kreator Konten",
  },
  {
    quote:
      '"Gak nyangka ada aplikasi gratis sekeren ini. Saya donasi karena development-nya rajin update fitur baru."',
    name: "Dewi Lestari",
    role: "Digital Artist",
  },
] as const;

export default function DonasiScreen() {
  const insets = useSafeAreaInsets();
  const tabBarOffset = 88 + insets.bottom;
  const [guideVisible, setGuideVisible] = useState(false);

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
        <View className="px-6 pt-8 pb-12 items-center">
          <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <IconSymbol
              name="heart.fill"
              size={14}
              color={socialPalette.accent}
            />
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-social-accent">
              Dukung Kreativitas
            </Text>
          </View>

          <Text className="text-center text-4xl leading-tight font-extrabold text-white">
            Jaga Media Tools{"\n"}
            <Text className="text-social-accent">Gratis Selamanya</Text>
          </Text>
          <Text className="text-center text-social-slate-500 text-sm leading-6 mt-4 max-w-[330px]">
            Bantu kami menjaga layanan tetap cepat, gratis, dan tanpa iklan
            untuk komunitas kreatif Indonesia.
          </Text>
        </View>

        <View className="px-6 mb-14">
          <View className="flex flex-col gap-4">
            {DONATION_PRESETS.map((preset) => {
              const highlighted = preset.id === HIGHLIGHT_PRESET_ID;
              return (
                <View
                  key={preset.id}
                  className="rounded-[30px] border overflow-hidden"
                  style={{
                    borderColor: highlighted
                      ? socialPalette.accentGlowStrong
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <View className="p-5 bg-white/5">
                    <View className="flex-row items-center gap-4">
                      <View
                        className="w-14 h-14 rounded-2xl items-center justify-center border"
                        style={{
                          backgroundColor: socialPalette.accentFaint,
                          borderColor: socialPalette.accentGlowMidStrong,
                        }}
                      >
                        <IconSymbol
                          name={PRESET_ICON[preset.id]}
                          size={24}
                          color={
                            highlighted
                              ? socialPalette.accentEnd
                              : socialPalette.accent
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-end justify-between gap-3">
                          <View className="flex-1 min-w-0">
                            <Text className="text-3xl text-white font-extrabold">
                              {preset.id === "custom"
                                ? "Nominal lain"
                                : preset.label}
                            </Text>
                            <Text className="text-social-slate-500 text-sm leading-5 mt-1.5">
                              {preset.description}
                            </Text>
                          </View>
                          <Pressable className="rounded-2xl overflow-hidden active:opacity-90 shrink-0">
                            <LinearGradient
                              colors={
                                highlighted
                                  ? [
                                      socialPalette.accent,
                                      socialPalette.accentEnd,
                                    ]
                                  : [socialPalette.cardFrom, socialPalette.bg]
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                paddingHorizontal: 20,
                                paddingVertical: 12,
                                borderWidth: 1,
                                borderColor: highlighted
                                  ? socialPalette.accentGlowStrong
                                  : "rgba(255,255,255,0.14)",
                              }}
                            >
                              <Text className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                Pilih
                              </Text>
                            </LinearGradient>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="px-6 mb-14 items-center">
          <Text className="text-2xl font-extrabold text-white mb-5">
            Pembayaran <Text className="text-social-accent">QRIS</Text>
          </Text>
          <View
            className="p-6 rounded-[34px] border"
            style={{
              borderColor: socialPalette.accentGlowMidStrong,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <View className="w-60 h-60 rounded-3xl bg-white p-3">
              <Image
                source={{
                  uri: "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=MediaToolsDonasi",
                }}
                contentFit="contain"
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text className="mt-5 text-xs text-social-slate-500 text-center max-w-[230px]">
              Scan kode di atas menggunakan aplikasi Bank atau E-Wallet favorit
              Anda.
            </Text>
          </View>
        </View>

        <View className="px-6 mb-14">
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
                    Panduan Transfer
                  </Text>
                  <Text className="text-white text-sm font-bold">
                    Bank & E-Wallet
                  </Text>
                  <Text className="text-social-slate-500 text-xs mt-1 leading-5">
                    Langkah scan QRIS dari M-Banking atau dompet digital.
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

        <View className="px-6 mb-14">
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
                Ke Mana Dana{"\n"}
                <Text className="text-social-accent">Anda Pergi?</Text>
              </Text>
              <View className="flex flex-col gap-4">
                {FUND_USAGE.map((item) => (
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

        <View className="px-6 mb-14">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="h-0.5 w-8 bg-social-accent" />
            <Text className="text-social-accent text-[11px] font-black uppercase tracking-[0.2em]">
              Kesan Komunitas
            </Text>
          </View>
          <View className="flex flex-col gap-4">
            {TESTIMONIALS.map((item) => (
              <View
                key={item.name}
                className="p-6 rounded-[30px] border border-white/10 bg-white/5"
              >
                <Text className="text-sm italic leading-6 text-social-slate-500 mb-5">
                  {item.quote}
                </Text>
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[socialPalette.accent, socialPalette.accentEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 42, height: 42, borderRadius: 14 }}
                  />
                  <View>
                    <Text className="text-sm text-white font-bold">
                      {item.name}
                    </Text>
                    <Text className="text-[10px] text-social-slate-500 font-black uppercase tracking-[0.1em]">
                      {item.role}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
                Pahlawan{"\n"}
                <Text className="text-social-accent">Media Tools</Text>
              </Text>
              <Text className="text-center text-social-slate-500 text-sm leading-6 mt-4 mb-8 max-w-[240px]">
                Jadilah bagian dari perjalanan kami dalam membangun alat kreatif
                terbaik di Indonesia.
              </Text>
              <Pressable className="w-full rounded-3xl overflow-hidden active:opacity-90">
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
                    Mulai Berdonasi
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
