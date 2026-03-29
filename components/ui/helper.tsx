import { useEffect } from "react";

import { useVideoPlayer, VideoView } from "expo-video";

import { socialPalette } from "@/lib/pallate";

import { View, Text, Pressable, Linking } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

const ACCENT = socialPalette.accent;

//================================ Permission Settings =================================//

export function StatusPill({ granted }: { granted: boolean }) {
  if (granted) {
    return (
      <View className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#59f3a6]/10">
        <Text className="text-[#59f3a6] text-[9px] font-black uppercase tracking-widest">
          Granted
        </Text>
      </View>
    );
  }

  return (
    <View className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f3cf58]/10">
      <Text className="text-[#f3cf58] text-[9px] font-black uppercase tracking-widest">
        Pending
      </Text>
    </View>
  );
}

export function Toggle({
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
      hitSlop={10}
      className="w-10 h-5 rounded-full bg-white/10 justify-center"
      style={{
        opacity: disabled ? 0.55 : 1,
        backgroundColor: value ? ACCENT : "rgba(255,255,255,0.10)",
      }}
    >
      <View
        className="w-4 h-4 rounded-full bg-white"
        style={{ transform: [{ translateX: value ? 20 : 2 }] }}
      />
    </Pressable>
  );
}

export function PermissionCard({
  title,
  description,
  iconName,
  iconTint,
  iconBg,
  granted,
  checking,
  busy,
  onRequest,
  showDeny,
}: {
  title: string;
  description: string;
  iconName: "hard-drive" | "camera" | "mic" | "folder.search";
  iconTint: string;
  iconBg: string;
  granted: boolean;
  checking?: boolean;
  busy: boolean;
  onRequest: () => void;
  showDeny?: boolean;
}) {
  const disabled = busy || checking;
  return (
    <View className="p-5 rounded-[40px] bg-white/[0.03] border border-white/5 overflow-hidden">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-4">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <IconSymbol name={iconName} size={24} color={iconTint} />
          </View>
          <View>
            <Text className="text-base font-bold text-white">{title}</Text>
            <StatusPill granted={granted} />
          </View>
        </View>

        <Toggle
          value={granted}
          onPress={onRequest}
          disabled={disabled || granted}
        />
      </View>

      <Text className="text-xs text-slate-500 mb-6 leading-relaxed">
        {description}
      </Text>

      {!granted && (
        <View className="flex-row gap-2">
          <Pressable
            onPress={onRequest}
            disabled={disabled}
            className="flex-1 py-3 rounded-2xl bg-[#ff3d57] items-center justify-center"
            style={{ opacity: disabled ? 0.6 : 1 }}
          >
            <Text className="text-white text-[10px] font-black uppercase tracking-widest">
              {busy
                ? "Requesting..."
                : checking
                  ? "Checking..."
                  : "Grant Access"}
            </Text>
          </Pressable>

          {showDeny && (
            <Pressable
              onPress={() => void Linking.openSettings()}
              className="px-6 py-3 rounded-2xl bg-white/5 items-center justify-center"
            >
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Deny
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export function PreviewVideo({ uri, isVisible }: { uri: string; isVisible: boolean }) {
  const player = useVideoPlayer({ uri }, (p: any) => {
    p.loop = true;
  });

  useEffect(() => {
    if (isVisible) player.play();
    else player.pause();
  }, [isVisible, player]);

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      contentFit="contain"
      nativeControls
    />
  );
}