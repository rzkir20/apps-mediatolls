import React, { useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheets } from "@/components/BottomSheets";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

const BG = socialPalette.bg;

const ACCENT = socialPalette.accent;

export default function SettingsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const [openFaq, setOpenFaq] = useState(0);
  const [exportSheetVisible, setExportSheetVisible] = useState(false);

  const faqItems = [
    {
      question: "Apakah Media Tools menyimpan file saya?",
      answer:
        "Tidak. File diunduh langsung ke storage Anda dan tidak disimpan di server Media Tools.",
    },
    {
      question: "Bagaimana dengan data login sosial media?",
      answer:
        "Media Tools tidak menyimpan kredensial login Anda. Proses autentikasi dikelola langsung oleh platform resmi terkait.",
    },
  ];

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
          <View className="items-center mb-1">
            <LinearGradient
              colors={["#ff3d57", "#bc1888"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-20 h-20 rounded-[28px] items-center justify-center mb-5"
            >
              <IconSymbol name="lock" size={36} color="#fff" />
            </LinearGradient>
            <Text className="text-3xl font-cabinet font-black tracking-tight text-white text-center">
              Security & <Text style={{ color: ACCENT }}>Privacy</Text>
            </Text>
            <Text className="text-slate-400 text-sm font-medium mt-2 text-center">
              Data Anda adalah prioritas utama kami.
            </Text>
          </View>

          <View className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] flex-row items-center gap-3">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <View className="flex-1">
              <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">
                Sistem Aman
              </Text>
              <Text className="text-[10px] text-slate-500 font-medium">
                Semua protokol enkripsi aktif dan berjalan normal.
              </Text>
            </View>
            <IconSymbol name="checkmark" size={18} color="#10b981" />
          </View>

          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
              Gambaran Privasi
            </Text>
            <View className="rounded-[28px] p-5 border border-white/10 bg-white/[0.03] gap-5">
              <View className="flex-row gap-4">
                <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center">
                  <IconSymbol name="search" size={18} color="#22d3ee" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white mb-1">
                    Tanpa Pelacakan
                  </Text>
                  <Text className="text-[12px] leading-relaxed text-slate-400">
                    Kami tidak melacak aktivitas browsing Anda di luar aplikasi
                    Media Tools.
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center">
                  <IconSymbol name="devices" size={18} color="#bc1888" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white mb-1">
                    Penyimpanan Lokal
                  </Text>
                  <Text className="text-[12px] leading-relaxed text-slate-400">
                    Riwayat unduhan disimpan secara lokal di perangkat Anda,
                    bukan di server kami.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
              Protokol Keamanan
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-3xl p-5 border border-white/10 bg-white/[0.03]">
                <IconSymbol name="lock" size={24} color="#ff3d57" />
                <Text className="text-[13px] font-bold text-white mt-3 mb-1">
                  SSL/TLS
                </Text>
                <Text className="text-[10px] text-slate-500 leading-normal">
                  Enkripsi transmisi data tingkat tinggi.
                </Text>
              </View>
              <View className="flex-1 rounded-3xl p-5 border border-white/10 bg-white/[0.03]">
                <IconSymbol name="settings" size={24} color="#fbbf24" />
                <Text className="text-[13px] font-bold text-white mt-3 mb-1">
                  AES-256
                </Text>
                <Text className="text-[10px] text-slate-500 leading-normal">
                  Standar enkripsi data saat disimpan.
                </Text>
              </View>
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
              Hak Data Anda
            </Text>

            <Pressable
              onPress={() => setExportSheetVisible(true)}
              className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="download" size={18} color="#94a3b8" />
                <Text className="text-sm font-bold text-white">
                  Ekspor Data Saya
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#94a3b8" />
            </Pressable>
          </View>

          <View>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
              Tanya Jawab Keamanan
            </Text>
            <View className="gap-3">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;

                return (
                  <Pressable
                    key={item.question}
                    onPress={() =>
                      setOpenFaq((prev) => (prev === index ? -1 : index))
                    }
                    className={`rounded-2xl p-5 border border-white/10 bg-white/[0.03] ${isOpen ? "" : "opacity-60"}`}
                  >
                    <View
                      className={`flex-row items-center justify-between ${isOpen ? "mb-2" : ""}`}
                    >
                      <Text className="text-xs font-bold text-white flex-1 pr-3">
                        {item.question}
                      </Text>
                      <IconSymbol
                        name={isOpen ? "close" : "plus"}
                        size={16}
                        color="#64748b"
                      />
                    </View>

                    {isOpen ? (
                      <Text className="text-[11px] leading-relaxed text-slate-500">
                        {item.answer}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => openUrl("mailto:security@mediatools.app")}
            className="h-14 rounded-2xl items-center justify-center"
          >
            <LinearGradient
              colors={["#ff3d57", "#bc1888"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-14 w-full rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-[11px] font-black uppercase tracking-[0.2em]">
                Hubungi Tim Keamanan
              </Text>
            </LinearGradient>
          </Pressable>

          <View className="items-center pb-2">
            <Text className="text-[10px] text-slate-600 font-medium uppercase tracking-[0.2em] text-center">
              Terverifikasi oleh MediaTools Trust Engine
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomSheets
        visible={exportSheetVisible}
        onClose={() => setExportSheetVisible(false)}
        title="Ekspor Data"
      >
        <View className="pb-6">
          <Text className="text-sm font-semibold text-white">
            data anda masuk ke dalam penyimpanan data device
          </Text>
          <Text className="text-[11px] leading-relaxed text-slate-400 mt-2">
            Jika kamu menghapus aplikasi atau membersihkan data aplikasi, data
            ini bisa ikut terhapus.
          </Text>

          <Pressable
            onPress={() => setExportSheetVisible(false)}
            className="mt-5 h-12 rounded-2xl items-center justify-center border border-white/10 bg-white/[0.04]"
          >
            <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
              Tutup
            </Text>
          </Pressable>
        </View>
      </BottomSheets>
    </View>
  );
}
