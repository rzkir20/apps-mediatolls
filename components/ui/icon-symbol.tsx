import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { SymbolWeight } from "expo-symbols";

import { ComponentProps } from "react";

import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = {
  [key: string]: ComponentProps<typeof MaterialIcons>["name"];
};
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.down": "keyboard-arrow-down",
  play: "play-arrow",
  "play.fill": "play-circle-filled",
  plus: "add",
  star: "star",
  "star.fill": "star",
  search: "search",
  info: "info",
  compass: "explore",
  download: "download",
  bookmark: "bookmark",
  book: "menu-book",
  movie: "movie",
  tv: "tv",
  "play.tv": "live-tv",
  drama: "theater-comedy",
  person: "person",
  "person.circle": "account-circle",
  "arrow.back": "arrow-back",
  "slider.horizontal.3": "reorder",
  share: "share",
  lock: "lock",
  checkmark: "check",
  close: "close",
  // Anime filters
  filter: "tune",
  zap: "bolt",
  "arrow.forward": "arrow-forward",
  layers: "layers",
  "doc.text": "description",
  "heart.fill": "favorite",
  history: "history",
  devices: "devices",
  smartphone: "smartphone",
  tablet: "tablet",
  laptop: "laptop",
  monitor: "desktop-windows",
  "doc.on.clipboard": "content-paste",
} as IconMapping;

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
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
