import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";

import * as FileSystem from "expo-file-system/legacy";

import React, { useEffect, useMemo, useState } from "react";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

type SortKey = "latest" | "oldest" | "size";

function formatBytes(bytes: number) {
  const KB = 1000;
  const MB = KB * 1000;
  const GB = MB * 1000;

  const isInt = (n: number) => Math.abs(n - Math.round(n)) < 0.01;
  const fmt = (value: number, unit: string) => {
    const decimals = isInt(value) ? 0 : 1;
    return `${value.toFixed(decimals)} ${unit}`;
  };

  if (bytes < KB) return `${bytes.toFixed(0)} B`;
  if (bytes < MB) return fmt(bytes / KB, "KB");
  if (bytes < GB) return fmt(bytes / MB, "MB");
  return fmt(bytes / GB, "GB");
}

export default function SystemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const [searchText, setSearchText] = useState("");

  const [storageLoading, setStorageLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [storageErrorText, setStorageErrorText] = useState<string | null>(null);
  const [storageRetryNonce, setStorageRetryNonce] = useState(0);
  const [storageTotalBytes, setStorageTotalBytes] = useState<number | null>(
    null,
  );
  const [storageFreeBytes, setStorageFreeBytes] = useState<number | null>(null);
  const storageUsedBytes = useMemo(() => {
    if (storageTotalBytes == null || storageFreeBytes == null) return null;
    return Math.max(0, storageTotalBytes - storageFreeBytes);
  }, [storageTotalBytes, storageFreeBytes]);

  const storagePercentUsed = useMemo(() => {
    if (storageUsedBytes == null || storageTotalBytes == null) return null;
    if (storageTotalBytes <= 0) return 0;
    return (storageUsedBytes / storageTotalBytes) * 100;
  }, [storageTotalBytes, storageUsedBytes]);

  useEffect(() => {
    let cancelled = false;

    const loadStorage = async () => {
      try {
        setStorageLoading(true);
        setStorageError(false);
        setStorageErrorText(null);
        const [free, total] = await Promise.all([
          FileSystem.getFreeDiskStorageAsync(),
          FileSystem.getTotalDiskCapacityAsync(),
        ]);

        if (cancelled) return;
        setStorageFreeBytes(free);
        setStorageTotalBytes(total);
      } catch (e) {
        // If this fails (platform limitations), fall back to the UI skeleton.
        if (cancelled) return;
        setStorageError(true);
        const msg = e instanceof Error ? e.message : String(e);
        setStorageErrorText(msg);
        setStorageFreeBytes(null);
        setStorageTotalBytes(null);
      } finally {
        if (!cancelled) setStorageLoading(false);
      }
    };

    void loadStorage();

    return () => {
      cancelled = true;
    };
  }, [storageRetryNonce]);

  const categories = useMemo(
    () => [
      {
        key: "videos" as const,
        title: "Videos",
        icon: "video" as const,
        iconBg: "rgba(59, 130, 246, 0.10)",
        iconColor: "#3b82f6",
        meta: "42 Files • 124 MB",
      },
      {
        key: "images" as const,
        title: "Images",
        icon: "photo" as const,
        iconBg: "rgba(225, 29, 72, 0.10)",
        iconColor: socialPalette.accent,
        meta: "128 Files • 18 MB",
      },
      {
        key: "audio" as const,
        title: "Audio",
        icon: "music.note" as const,
        iconBg: "rgba(249, 115, 22, 0.10)",
        iconColor: "#f97316",
        meta: "12 Files • 9.4 MB",
      },
      {
        key: "stories" as const,
        title: "Stories",
        icon: "drama" as const,
        iconBg: "rgba(6, 182, 212, 0.10)",
        iconColor: "#06b6d4",
        meta: "8 Files • 5.4 MB",
      },
    ],
    [],
  );

  const storageUsedText =
    storageUsedBytes == null ? "Tidak tersedia" : formatBytes(storageUsedBytes);
  const storageTotalText =
    storageTotalBytes == null
      ? "Tidak tersedia"
      : formatBytes(storageTotalBytes);
  const storagePercentRounded = Math.round(storagePercentUsed ?? 0);

  return (
    <View className="flex-1 bg-social-bg">
      <View className="px-6 pt-4 pb-6 flex-row items-center gap-2">
        <Pressable
          onPress={() => router.push("/(tabs)/social")}
          className="w-10 h-10 rounded-full items-center justify-center"
          accessibilityRole="button"
        >
          <IconSymbol
            name="arrow.back"
            size={22}
            color="rgba(255,255,255,0.70)"
          />
        </Pressable>

        <Text className="text-xl font-cabinet font-extrabold tracking-tight text-white">
          Back to Social
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
      >
        <View className="px-6 mt-2">
          <Text className="text-3xl font-cabinet font-extrabold tracking-tight leading-none mb-6 text-white">
            Files{"\n"}
            <Text className="text-social-accent">Manager</Text>
          </Text>

          <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex-row items-center gap-3 mb-8">
            <IconSymbol
              name="search"
              size={18}
              color={socialPalette.slate500}
            />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search downloads..."
              placeholderTextColor={socialPalette.slate600}
              className="flex-1 text-sm font-medium text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="px-0 mb-8">
            <View className="p-6 rounded-[32px] bg-white/5 border border-white/10 relative overflow-hidden">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-col">
                  <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Storage Status
                  </Text>
                  <Text className="text-xl font-cabinet font-extrabold text-white">
                    {storageLoading ? "Loading..." : storageUsedText}{" "}
                    <Text className="text-slate-500 text-sm font-medium">
                      / {storageLoading ? "—" : storageTotalText}
                    </Text>
                  </Text>
                </View>

                <View className="w-10 h-10 rounded-xl bg-social-accent/10 items-center justify-center">
                  <IconSymbol
                    name="hard-drive"
                    size={22}
                    color={socialPalette.accent}
                  />
                </View>
              </View>

              <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: `${storagePercentRounded}%`,
                    height: "100%",
                  }}
                />
              </View>

              <Text className="mt-3 text-[11px] font-medium text-slate-400">
                {storageLoading
                  ? "— of total storage used"
                  : storageError
                    ? "Tidak bisa membaca storage device"
                    : `${storagePercentRounded}% of total storage used`}
              </Text>

              {storageError && storageErrorText ? (
                <Text
                  className="mt-1 text-[10px] font-medium text-slate-500"
                  numberOfLines={3}
                >
                  {storageErrorText}
                </Text>
              ) : null}

              {storageError ? (
                <Pressable
                  onPress={() => setStorageRetryNonce((n) => n + 1)}
                  className="mt-3 w-full py-3 rounded-2xl bg-white/5 border border-white/10 items-center active:opacity-90"
                >
                  <Text className="text-xs font-black uppercase tracking-widest text-white">
                    Coba lagi
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-black uppercase tracking-widest text-slate-500">
                Categories
              </Text>

              <View className="flex-row items-center gap-2">
                <IconSymbol
                  name="filter"
                  size={14}
                  color={socialPalette.slate500}
                />

                <View className="flex-row rounded-2xl border border-white/10 overflow-hidden">
                  {(
                    [
                      { key: "latest" as const, label: "Latest" },
                      { key: "oldest" as const, label: "Oldest" },
                      { key: "size" as const, label: "Size" },
                    ] as const
                  ).map((opt) => {
                    const active = opt.key === sortKey;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => setSortKey(opt.key)}
                        className="px-3 py-2 items-center justify-center"
                        style={
                          active
                            ? {
                                backgroundColor: socialPalette.accent,
                              }
                            : { backgroundColor: "rgba(255,255,255,0.02)" }
                        }
                      >
                        <Text
                          className="text-[11px] font-bold uppercase tracking-widest"
                          style={{
                            color: active ? "#fff" : socialPalette.slate600,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-4">
              {categories.map((c) => (
                <Pressable
                  key={c.key}
                  className="w-[48%] p-5 rounded-[40px] bg-white/5 border border-white/5 flex-col items-start"
                  style={{ opacity: 1 }}
                  accessibilityRole="button"
                  onPress={() => {
                    // For now the design is static; wiring filtering can come later.
                    // Keeping it non-blocking to avoid unexpected UX changes.
                    setSortKey((prev) => prev);
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                    style={{ backgroundColor: c.iconBg }}
                  >
                    <IconSymbol name={c.icon} size={24} color={c.iconColor} />
                  </View>

                  <Text className="text-base font-bold text-white">
                    {c.title}
                  </Text>
                  <Text className="text-[11px] font-medium text-slate-500 mt-1">
                    {c.meta}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
