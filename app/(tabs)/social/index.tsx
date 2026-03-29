import * as Clipboard from "expo-clipboard";

import { LinearGradient } from "expo-linear-gradient";

import React, { useCallback, useState } from "react";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

const BG = "#05060f";
const ACCENT = "#ff3d57";
const ACCENT_END = "#e11d48";
const SLATE_500 = "#64748b";
const SLATE_600 = "#475569";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const onPaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUrl(text.trim());
  }, []);

  const onDownload = useCallback(() => {
    if (!url.trim() || isDownloading) return;
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1800);
  }, [url, isDownloading]);

  const tabBarOffset = 88 + insets.bottom;

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <View
        style={{ paddingTop: insets.top }}
        className="px-6 pb-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          <LinearGradient
            colors={[ACCENT, ACCENT_END]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: ACCENT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <IconSymbol name="play.fill" size={20} color="#fff" />
          </LinearGradient>
          <Text className="text-xl font-extrabold tracking-tight text-white">
            MEDIA TOOLS
          </Text>
        </View>
        <Pressable className="w-10 h-10 rounded-full border border-white/10 items-center justify-center bg-white/5 active:opacity-80">
          <IconSymbol
            name="person.circle"
            size={22}
            color="rgba(255,255,255,0.7)"
          />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarOffset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-2 px-6 mb-10">
          <View className="flex-row items-center gap-3 mb-3">
            <View style={{ height: 2, width: 32, backgroundColor: ACCENT }} />
            <Text
              className="font-black text-[10px] tracking-[0.2em] uppercase"
              style={{ color: ACCENT }}
            >
              BE DIFFERENT
            </Text>
          </View>
          <Text className="text-4xl font-extrabold leading-tight tracking-tight text-white mb-2">
            Online Video{"\n"}
            <Text style={{ color: ACCENT }}>Downloader</Text>
          </Text>

          <View className="space-y-4 mt-6">
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="Insert TikTok Video Link Here..."
              placeholderTextColor={SLATE_600}
              className="w-full bg-black border border-white/10 rounded-2xl py-5 px-4 text-sm font-medium text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={onPaste}
                className="flex-1 py-4 px-4 rounded-2xl bg-white/5 border border-white/10 flex-row items-center justify-center gap-2 active:opacity-90"
              >
                <IconSymbol
                  name="doc.on.clipboard"
                  size={20}
                  color={SLATE_500}
                />
                <Text className="font-bold text-sm tracking-widest text-white">
                  TEMPEL
                </Text>
              </Pressable>
              <Pressable
                onPress={onDownload}
                disabled={isDownloading || !url.trim()}
                className="flex-[1.5] rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: isDownloading || !url.trim() ? 0.55 : 1 }}
              >
                <LinearGradient
                  colors={[ACCENT, ACCENT_END]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 52,
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {isDownloading ? (
                    <Text className="font-black text-sm tracking-widest text-white uppercase">
                      Processing...
                    </Text>
                  ) : (
                    <Text className="font-black text-sm tracking-widest text-white uppercase">
                      Download
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          <View className="mt-8 flex-row items-center gap-4">
            <Text
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: SLATE_500 }}
            >
              Supported:
            </Text>
            <View className="flex-row gap-4" style={{ opacity: 0.85 }}>
              <IconSymbol name="monitor" size={20} color={SLATE_500} />
              <IconSymbol name="smartphone" size={20} color={SLATE_500} />
              <IconSymbol name="tablet" size={20} color={SLATE_500} />
              <IconSymbol name="laptop" size={20} color={SLATE_500} />
            </View>
          </View>
        </View>

        <View className="px-6 mb-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-extrabold italic tracking-tight uppercase text-white">
              Recent <Text style={{ color: ACCENT }}>History</Text>
            </Text>
            <Pressable>
              <Text
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: ACCENT }}
              >
                Clear History
              </Text>
            </Pressable>
          </View>
          <View className="border-2 border-dashed border-white/5 rounded-3xl py-10 items-center justify-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${ACCENT}1A` }}
            >
              <IconSymbol name="history" size={28} color={ACCENT} />
            </View>
            <Text className="text-slate-500 text-xs font-medium text-center px-4">
              Belum ada riwayat. Isi link TikTok lalu download.
            </Text>
          </View>
        </View>

        <View className="px-6 mb-8">
          <View className="p-6 rounded-[32px] border border-white/5 overflow-hidden relative">
            <LinearGradient
              colors={["#12131a", BG]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <View className="absolute -right-4 -top-4 opacity-[0.07] pointer-events-none">
              <IconSymbol name="zap" size={100} color="#fff" />
            </View>
            <Text className="text-lg font-extrabold text-white">
              VideoMAX Pro
            </Text>
            <Text className="text-slate-400 text-xs mt-1 mb-4 leading-relaxed">
              Explore our premium downloader for faster multi-thread
              downloading.
            </Text>
            <Pressable
              className="self-start px-6 py-3 rounded-full active:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              <Text className="text-white font-extrabold text-[10px] tracking-widest uppercase">
                Explore Now
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
