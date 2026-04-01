import React from "react";

import { Pressable, ScrollView, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { socialPalette } from "@/lib/pallate";

import { useSettingsPermissionsController } from "@/services/settings.service";

import { PermissionCard } from "@/components/ui/helper";

const BG = socialPalette.bg;

const ACCENT = socialPalette.accent;

export default function SettingsPermissionsScreen() {
  const insets = useSafeAreaInsets();
  const {
    mediaLibrary,
    camera,
    microphone,
    isRefreshing,
    busy,
    localError,
    filesAccess,
    allGranted,
    safeRequest,
    onGrantAll,
  } = useSettingsPermissionsController();

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
              Privacy & Security
            </Text>
          </View>

          <Text className="text-4xl font-cabinet font-extrabold leading-[44px] tracking-tight text-white">
            App{"\n"}
            <Text style={{ color: ACCENT }}>Permissions</Text>
          </Text>

          <Text className="text-slate-400 text-sm font-medium leading-relaxed">
            Untuk memberikan pengalaman terbaik, Media Tools memerlukan akses ke
            beberapa fitur perangkat Anda. Privasi Anda adalah prioritas kami.
          </Text>
        </View>

        <View className="px-4 flex flex-col gap-6">
          {!!localError && (
            <View className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 mb-2">
              <Text className="text-xs font-semibold text-red-200">
                {localError}
              </Text>
            </View>
          )}

          <PermissionCard
            title="Storage Access"
            description="Access your device storage to save downloaded content directly to your gallery."
            iconName="hard-drive"
            iconTint="#3b82f6"
            iconBg="rgba(59,130,246,0.10)"
            granted={mediaLibrary}
            checking={isRefreshing}
            busy={busy === "storage"}
            onRequest={() => void safeRequest("storage")}
            showDeny
          />

          <PermissionCard
            title="Camera"
            description="Used for video recording features and AR filters within the internal media player."
            iconName="camera"
            iconTint="#a855f7"
            iconBg="rgba(168,85,247,0.10)"
            granted={camera}
            checking={isRefreshing}
            busy={busy === "camera"}
            onRequest={() => void safeRequest("camera")}
          />

          <PermissionCard
            title="Microphone"
            description="Required for audio recording, voice processing, and format conversion stabilization."
            iconName="mic"
            iconTint="#f97316"
            iconBg="rgba(249,115,22,0.10)"
            granted={microphone}
            checking={isRefreshing}
            busy={busy === "mic"}
            onRequest={() => void safeRequest("mic")}
          />

          <PermissionCard
            title="Files Access"
            description="Permission to access and manage your files for document conversion and batch renaming."
            iconName="folder.search"
            iconTint="#06b6d4"
            iconBg="rgba(6,182,212,0.10)"
            granted={filesAccess}
            checking={isRefreshing}
            busy={busy === "files"}
            onRequest={() => void safeRequest("files")}
          />

          <Pressable
            onPress={() => void onGrantAll()}
            disabled={allGranted || !!busy || isRefreshing}
            className="w-full py-5 rounded-[32px] items-center justify-center"
            style={{
              backgroundColor: ACCENT,
              opacity: allGranted || busy || isRefreshing ? 0.6 : 1,
              shadowColor: ACCENT,
              shadowOpacity: 0.3,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 16 },
              elevation: 10,
            }}
          >
            <Text className="text-white font-black uppercase tracking-[0.2em] text-xs">
              {allGranted ? "All Permissions Granted" : "Grant All Permissions"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
