import React from "react";

import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

import { DonasiHeader } from "@/components/donasi/Header";

const DONATION_TIERS = [
  {
    title: "Traktir Kopi",
    subtitle: "Dukungan Kecil",
    amount: "50rb",
    icon: "star" as const,
    highlighted: false,
  },
  {
    title: "Traktir Pizza",
    subtitle: "Dukungan Sedang",
    amount: "150rb",
    icon: "heart.fill" as const,
    highlighted: true,
  },
  {
    title: "Partner Premium",
    subtitle: "Dukungan Besar",
    amount: "500rb",
    icon: "bookmark" as const,
    highlighted: false,
  },
] as const;

const BANKS = ["BCA", "MANDIRI", "BRI", "BNI", "CIMB", "DANAMON"] as const;
const EWALLETS = [
  "GOPAY",
  "OVO",
  "DANA",
  "LINKAJA",
  "GCASH",
  "SHOPEEPAY",
] as const;

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
            {DONATION_TIERS.map((tier) => (
              <View
                key={tier.title}
                className="rounded-[30px] border overflow-hidden"
                style={{
                  borderColor: tier.highlighted
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
                        name={tier.icon}
                        size={24}
                        color={
                          tier.highlighted
                            ? socialPalette.accentEnd
                            : socialPalette.accent
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-extrabold">
                        {tier.title}
                      </Text>
                      <Text className="text-social-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                        {tier.subtitle}
                      </Text>
                      <View className="mt-4 flex-row items-center justify-between">
                        <Text className="text-3xl text-white font-extrabold">
                          {tier.amount}
                        </Text>
                        <Pressable className="rounded-2xl overflow-hidden active:opacity-90">
                          <LinearGradient
                            colors={
                              tier.highlighted
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
                              borderColor: tier.highlighted
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
            ))}
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
          <View className="flex-row items-center gap-3 mb-6">
            <View className="h-0.5 w-8 bg-social-accent" />
            <Text className="text-social-accent text-[11px] font-black uppercase tracking-[0.2em]">
              Panduan Transfer
            </Text>
          </View>

          <View className="flex flex-col gap-4">
            <View className="p-5 rounded-[28px] border border-white/10 bg-white/5">
              <Text className="text-sm font-black uppercase tracking-[0.15em] text-white mb-3">
                Bank Indonesia
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {BANKS.map((bank) => (
                  <View
                    key={bank}
                    className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 items-center justify-center"
                  >
                    <Text className="text-[10px] font-black tracking-widest text-social-slate-500">
                      {bank}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-xs leading-6 text-social-slate-500">
                1. Buka aplikasi M-Banking Anda.{"\n"}2. Pilih menu QRIS atau
                Scan.{"\n"}3. Scan QR code yang tersedia dan selesaikan
                pembayaran.
              </Text>
            </View>

            <View className="p-5 rounded-[28px] border border-white/10 bg-white/5">
              <Text className="text-sm font-black uppercase tracking-[0.15em] text-white mb-3">
                E-Wallet
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {EWALLETS.map((wallet) => (
                  <View
                    key={wallet}
                    className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 items-center justify-center"
                  >
                    <Text className="text-[10px] font-black tracking-widest text-social-slate-500">
                      {wallet}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-xs leading-6 text-social-slate-500">
                1. Buka aplikasi E-Wallet Anda.{"\n"}2. Klik Bayar / Pay / Scan.
                {"\n"}3. Scan QR code dan konfirmasi nominal donasi.
              </Text>
            </View>
          </View>
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
    </View>
  );
}
