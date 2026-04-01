import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { SymbolWeight } from "expo-symbols";

import { ComponentProps } from "react";

import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = {
  [key: string]: ComponentProps<typeof MaterialIcons>["name"];
};

export const ICON_SYMBOL_MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.down": "keyboard-arrow-down",
  play: "play-arrow",
  "play.fill": "play-circle-filled",
  "play.circle": "play-circle-outline",
  plus: "add",
  star: "star",
  "star.fill": "star",
  search: "search",
  info: "info",
  compass: "explore",
  download: "download",
  "arrow.down": "arrow-downward",
  bookmark: "bookmark",
  book: "menu-book",
  movie: "movie",
  tv: "tv",
  "play.tv": "live-tv",
  drama: "theater-comedy",
  person: "person",
  "person.circle": "account-circle",
  mic: "mic",
  camera: "photo-camera",
  photo: "photo",
  "hard-drive": "storage",
  "folder.search": "folder-open",
  "arrow.back": "arrow-back",
  "slider.horizontal.3": "reorder",
  share: "share",
  lock: "lock",
  settings: "settings",
  checkmark: "check",
  close: "close",
  xmark: "close",
  // Anime filters
  filter: "tune",
  zap: "bolt",
  "arrow.forward": "arrow-forward",
  layers: "layers",
  "doc.text": "description",
  "heart.fill": "favorite",
  quality: "high-quality",
  video: "movie",
  history: "history",
  "history.clear": "delete-outline",
  "history.type.video": "videocam",
  "history.type.image": "photo-library",
  "history.type.music": "music-note",
  devices: "devices",
  smartphone: "smartphone",
  tablet: "tablet",
  laptop: "laptop",
  monitor: "desktop-windows",
  "doc.on.clipboard": "content-paste",
  "music.note": "music-note",
  "file.mp4": "movie",
  "file.image": "image",
  "file.mp3": "audiotrack",
  "format.jpg": "image",
  "format.png": "photo",
  "format.mp4": "movie",
  "format.gif": "gif",
  "brand.tiktok": "tiktok",
  "brand.instagram": "camera-alt",
  "brand.facebook": "facebook",
  "brand.youtube": "play-circle-filled",
  "brand.web": "public",
  trash: "delete",
} as const satisfies IconMapping;

export type IconSymbolName = keyof typeof ICON_SYMBOL_MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const resolvedName = ICON_SYMBOL_MAPPING[name] ?? "help-outline";
  const resolvedColor =
    color != null && typeof color === "string" ? color : "#64748b";

  return (
    <MaterialIcons
      color={resolvedColor}
      size={size}
      name={resolvedName}
      style={style}
    />
  );
}
