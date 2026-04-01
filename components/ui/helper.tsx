import { useEffect, useRef } from "react";

import { useVideoPlayer, VideoView } from "expo-video";

import { socialPalette } from "@/lib/pallate";

import { Linking, Platform, Pressable, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

const ACCENT = socialPalette.accent;

const FB_BLUE = "#1877F2";

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

export function PreviewVideo({
  uri,
  isVisible,
}: {
  uri: string;
  isVisible: boolean;
}) {
  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;

  const player = useVideoPlayer(null, (p: any) => {
    p.loop = true;
  });

  useEffect(() => {
    if (!uri) return;
    let cancelled = false;
    void player.replaceAsync({ uri, contentType: "auto" }).then(() => {
      if (cancelled) return;
      if (isVisibleRef.current) player.play();
    });
    return () => {
      cancelled = true;
    };
  }, [uri, player]);

  useEffect(() => {
    if (isVisible) player.play();
    else player.pause();
  }, [isVisible, player]);

  return (
    <View style={{ width: "100%", flex: 1, minHeight: 200 }}>
      <VideoView
        player={player}
        style={{ width: "100%", flex: 1 }}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

//================================ Social Platform Tabs =================================//
export const PLATFORM_TABS = [
  {
    id: "tiktok" as const,
    label: "TIKTOK",
    path: "/(tabs)/social" as const,
    icon: "brand.tiktok" as const,
  },
  {
    id: "instagram" as const,
    label: "INSTAGRAM",
    path: "/(tabs)/social/instagram" as const,
    icon: "brand.instagram" as const,
  },
  {
    id: "facebook" as const,
    label: "FACEBOOK",
    path: "/(tabs)/social/facebook" as const,
    icon: "brand.facebook" as const,
  },
  {
    id: "youtube" as const,
    label: "YOUTUBE",
    path: "/(tabs)/social/youtube" as const,
    icon: "brand.youtube" as const,
  },
  {
    id: "threads" as const,
    label: "THREADS",
    path: "/(tabs)/social/threads" as const,
    icon: "layers" as const,
  },
];

/** Index into `PLATFORM_TABS` for the current social route (0 = TikTok / index). */
export function getPlatformTabIndex(pathname: string): number {
  const onInstagram = pathname.includes("/instagram");
  const onYoutube = pathname.includes("/youtube");
  const onFacebook = pathname.includes("/facebook");
  const onThreads = pathname.includes("/threads");
  if (onInstagram) return 1;
  if (onFacebook) return 2;
  if (onYoutube) return 3;
  if (onThreads) return 4;
  return 0;
}

export function isPlatformActive(
  pathname: string,
  id: (typeof PLATFORM_TABS)[number]["id"],
) {
  const onInstagram = pathname.includes("/instagram");
  const onYoutube = pathname.includes("/youtube");
  const onFacebook = pathname.includes("/facebook");
  const onThreads = pathname.includes("/threads");
  if (id === "instagram") return onInstagram;
  if (id === "facebook") return onFacebook;
  if (id === "youtube") return onYoutube;
  if (id === "threads") return onThreads;
  if (id === "tiktok")
    return !onThreads && !onInstagram && !onFacebook && !onYoutube;
  return false;
}

//================================ History Type Icon Name & Supported Format Cards For Social Platforms =================================//
export function historyTypeIconName(
  type: HistoryItem["type"],
):
  | "history.type.video"
  | "history.type.image"
  | "history.type.music"
  | "photo" {
  switch (type) {
    case "Video":
      return "history.type.video";
    case "Image":
      return "history.type.image";
    case "Music":
      return "history.type.music";
    default:
      return "photo";
  }
}

export const SUPPORTED_FORMAT_CARDS = [
  {
    title: "mp4",
    sub: "Video MP4 (kualitas default)",
    icon: "video" as const,
    fullWidth: false,
  },
  {
    title: "shorts",
    sub: "Short-form Video",
    icon: "play.tv" as const,
    fullWidth: false,
  },
  {
    title: "mp3",
    sub: "Audio Only (ekstraksi berkualitas)",
    icon: "music.note" as const,
    fullWidth: true,
  },
  {
    title: "Quality",
    sub: "MP4 dengan pilihan kualitas",
    icon: "quality" as const,
    fullWidth: false,
  },
];

export const FORMAT_BADGES = [
  { label: "JPG", icon: "format.jpg" as const },
  { label: "PNG", icon: "format.png" as const },
  { label: "MP4", icon: "format.mp4" as const },
  { label: "GIF", icon: "format.gif" as const },
  { label: "MP3", icon: "file.mp3" as const },
] as const;

export const FORMAT_BADGES_FACEBOOK = [
  { label: "MP4", icon: "file.mp4" as const, tint: socialPalette.accent },
  { label: "MOV", icon: "video" as const, tint: FB_BLUE },
  { label: "MP3", icon: "file.mp3" as const, tint: "#fb923c" },
] as const;

//================================ Folders Name For Social Platforms =================================//
export function getPlatformAlbumName(
  platformKey:
    | "facebook"
    | "youtube"
    | "tiktok"
    | "instagram"
    | "documents"
    | "threads",
) {
  const base = "Media Tools";
  if (Platform.OS === "android") return `${base}/${platformKey}`;
  return `${base} (${platformKey})`;
}
