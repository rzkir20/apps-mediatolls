import AsyncStorage from "@react-native-async-storage/async-storage";

import * as MediaLibrary from "expo-media-library";

import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";

import { Camera } from "expo-camera";

import { router } from "expo-router";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import {
  STORAGE_KEY_PERMISSION_SETUP_COMPLETED,
  STORAGE_KEY_WELCOME_COMPLETED,
} from "@/lib/config";

import { socialPalette } from "@/lib/pallate";

type PermKey = "storage" | "camera" | "mic" | "gallery";

type PermStatus = {
  storage: boolean; // MediaLibrary covers storage/gallery in Expo
  camera: boolean;
  mic: boolean;
  gallery: boolean; // alias storage (kept for UI parity with design)
};

const BG = socialPalette.bg;
const ACCENT = socialPalette.accent;
const SUCCESS = socialPalette.accentFaint ? "#59f3a6" : "#59f3a6";

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-[32px] bg-white/[0.03] border border-white/5 overflow-hidden">
      <View className="p-6">{children}</View>
    </View>
  );
}

function TogglePill({
  value,
  onPress,
  disabled,
}: {
  value: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-12 h-7 rounded-full bg-white/10 justify-center"
      style={{ opacity: disabled ? 0.5 : 1 }}
      hitSlop={10}
    >
      <View
        className="w-5 h-5 rounded-full bg-white"
        style={{
          marginLeft: 4,
          transform: [{ translateX: value ? 20 : 0 }],
          backgroundColor: "#ffffff",
        }}
      />
      <View
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: value ? "rgba(255,61,87,0.9)" : "transparent",
        }}
      />
      <View
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white"
        style={{ transform: [{ translateX: value ? 20 : 0 }] }}
      />
    </Pressable>
  );
}

function GrantButton({
  label,
  granted,
  onPress,
  disabled,
}: {
  label: string;
  granted: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const text = granted ? "Permission Granted" : label;
  const baseClass =
    "w-full py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest";
  if (granted) {
    return (
      <View
        className={`${baseClass} bg-[${ACCENT}] border-[${ACCENT}]`}
        style={{
          backgroundColor: ACCENT,
          borderColor: ACCENT,
          shadowColor: ACCENT,
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        <Text className="text-center text-white">{text}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${baseClass} bg-white/5 border-white/10`}
      style={{ opacity: disabled ? 0.55 : 1 }}
    >
      <Text className="text-center text-slate-500">{text}</Text>
    </Pressable>
  );
}

export default function PermissionSetupScreen() {
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<PermStatus>({
    storage: false,
    camera: false,
    mic: false,
    gallery: false,
  });
  const [busyKey, setBusyKey] = useState<PermKey | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const allGranted =
    status.storage && status.camera && status.mic && status.gallery;

  const refresh = useCallback(async () => {
    setErrorText(null);
    try {
      const [ml, cam, mic] = await Promise.all([
        MediaLibrary.getPermissionsAsync(),
        Camera.getCameraPermissionsAsync(),
        getRecordingPermissionsAsync(),
      ]);
      const mlGranted = ml.status === "granted";
      setStatus({
        storage: mlGranted,
        gallery: mlGranted,
        camera: cam.status === "granted",
        mic: mic.status === "granted",
      });
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "Terjadi kesalahan");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const request = useCallback(
    async (key: PermKey) => {
      if (busyKey) return;
      setBusyKey(key);
      setErrorText(null);
      try {
        if (key === "storage" || key === "gallery") {
          const res = await MediaLibrary.requestPermissionsAsync();
          const ok = res.status === "granted";
          setStatus((s) => ({ ...s, storage: ok, gallery: ok }));
          return;
        }
        if (key === "camera") {
          const res = await Camera.requestCameraPermissionsAsync();
          const ok = res.status === "granted";
          setStatus((s) => ({ ...s, camera: ok }));
          return;
        }
        const res = await requestRecordingPermissionsAsync();
        const ok = res.status === "granted";
        setStatus((s) => ({ ...s, mic: ok }));
      } catch (e) {
        setErrorText(e instanceof Error ? e.message : "Terjadi kesalahan");
      } finally {
        setBusyKey(null);
      }
    },
    [busyKey],
  );

  const onContinue = useCallback(async () => {
    if (!allGranted) return;
    await AsyncStorage.setItem(STORAGE_KEY_PERMISSION_SETUP_COMPLETED, "true");
    router.replace("/(tabs)/social");
  }, [allGranted]);

  const onSkip = useCallback(async () => {
    const completedWelcome = await AsyncStorage.getItem(
      STORAGE_KEY_WELCOME_COMPLETED,
    );
    if (completedWelcome !== "true") {
      await AsyncStorage.setItem(STORAGE_KEY_WELCOME_COMPLETED, "true");
    }
    await AsyncStorage.setItem(STORAGE_KEY_PERMISSION_SETUP_COMPLETED, "true");
    router.replace("/(tabs)/social");
  }, []);

  const cards = useMemo(
    () => [
      {
        key: "storage" as const,
        title: "Storage & Media",
        subtitle: "Wajib untuk simpan unduhan",
        desc: "Izin ini digunakan untuk mengakses memori perangkat guna menyimpan video, musik, dan gambar yang Anda unduh.",
        iconName: "devices" as const,
        iconBg: "rgba(255,61,87,0.10)",
        buttonLabel: "Grant Storage Access",
      },
      {
        key: "camera" as const,
        title: "Camera Access",
        subtitle: "Untuk rekam konten video",
        desc: "Izin kamera diperlukan jika Anda ingin menggunakan fitur perekaman langsung atau pemindaian QR code di dalam aplikasi.",
        iconName: "movie" as const,
        iconBg: "rgba(255,61,87,0.10)",
        buttonLabel: "Grant Camera Access",
      },
      {
        key: "mic" as const,
        title: "Microphone",
        subtitle: "Rekam audio & voice-over",
        desc: "Dibutuhkan untuk merekam suara saat membuat konten video atau memberikan narasi suara pada hasil download.",
        iconName: "play.tv" as const,
        iconBg: "rgba(255,61,87,0.10)",
        buttonLabel: "Grant Microphone Access",
      },
      {
        key: "gallery" as const,
        title: "Gallery Access",
        subtitle: "Untuk konversi dokumen",
        desc: "Izin ini diperlukan untuk memilih gambar atau dokumen dari galeri Anda untuk dikonversi menjadi format lain.",
        iconName: "image" as const,
        iconBg: "rgba(255,61,87,0.10)",
        buttonLabel: "Grant Gallery Access",
      },
    ],
    [],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: BG }}>
      <View
        className="shrink-0 px-8 pb-6 pt-14"
        style={{ paddingTop: insets.top + 28 }}
      >
        <View className="flex-row items-center gap-3 mb-4">
          <View className="h-0.5 w-8" style={{ backgroundColor: ACCENT }} />
          <Text className="font-black text-[10px] tracking-[0.2em] uppercase text-social-accent">
            Setup Required
          </Text>
        </View>
        <Text className="font-cabinet text-4xl font-extrabold leading-[44px] tracking-tight text-white mb-3">
          Grant{"\n"}
          <Text style={{ color: ACCENT }}>Permissions</Text>
        </Text>
        <Text className="text-slate-400 text-sm font-medium leading-relaxed">
          Kami memerlukan izin Anda agar fitur aplikasi dapat berjalan dengan
          optimal.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-4 pb-10">
          {!!errorText && (
            <View className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <Text className="text-xs font-semibold text-red-200">
                {errorText}
              </Text>
            </View>
          )}

          {cards.map((c) => {
            const granted =
              c.key === "storage"
                ? status.storage
                : c.key === "camera"
                  ? status.camera
                  : c.key === "mic"
                    ? status.mic
                    : status.gallery;
            const isBusy = busyKey === c.key;
            return (
              <GlassCard key={c.key}>
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: c.iconBg }}
                    >
                      <IconSymbol name={c.iconName} size={22} color={ACCENT} />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-white">
                        {c.title}
                      </Text>
                      <Text className="text-[11px] text-slate-500 font-medium">
                        {c.subtitle}
                      </Text>
                    </View>
                  </View>

                  <TogglePill
                    value={granted}
                    disabled={isBusy}
                    onPress={() => void request(c.key)}
                  />
                </View>

                <Text className="text-xs text-slate-400 mb-5 leading-relaxed">
                  {c.desc}
                </Text>

                <GrantButton
                  label={isBusy ? "Requesting..." : c.buttonLabel}
                  granted={granted}
                  disabled={granted || isBusy}
                  onPress={() => void request(c.key)}
                />
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      <View
        className="shrink-0 px-8 pt-6 pb-[34px]"
        style={{ paddingBottom: insets.bottom + 34 }}
      >
        <Pressable
          onPress={() => void onContinue()}
          disabled={!allGranted}
          className="w-full py-4 rounded-3xl items-center justify-center"
          style={{
            backgroundColor: SUCCESS,
            opacity: allGranted ? 1 : 0.5,
          }}
        >
          <Text className="text-black font-black text-xs uppercase tracking-[0.2em]">
            Continue
          </Text>
        </Pressable>

        <Pressable onPress={() => void onSkip()} className="w-full py-2 mt-3">
          <Text className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Skip for now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
