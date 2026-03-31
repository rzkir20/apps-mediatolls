import { Image } from "expo-image";

import { Pressable, View, Text } from "react-native";

import { socialPalette } from "@/lib/pallate";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { historyTypeIconName } from "@/components/ui/helper";

export function HistoryCard({
  item,
  onPress,
  onDelete,
  showChevron = true,
  chevronIconName = "chevron.right",
  thumbnailVariant = "lg",
  containerClassName,
}: HistoryCardProps) {
  const typeIcon = historyTypeIconName(item.type);
  const thumbnailSizeClass =
    thumbnailVariant === "sm" ? "w-14 h-14" : "w-20 h-20";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 p-3 rounded-3xl bg-white/5 border border-white/10 active:opacity-90 ${containerClassName ?? ""}`}
    >
      <View
        className={`${thumbnailSizeClass} rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative`}
      >
        {!!item.cover ? (
          <Image
            source={{ uri: item.cover }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <IconSymbol
              name={typeIcon}
              size={22}
              color={socialPalette.slate500}
            />
          </View>
        )}
        {!!item.cover ? (
          <View className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/70 border border-white/15 items-center justify-center">
            <IconSymbol name={typeIcon} size={12} color="#fff" />
          </View>
        ) : null}
      </View>

      <View className="flex-1">
        <Text className="text-white font-extrabold text-xs" numberOfLines={2}>
          {item.title}
        </Text>
        <Text
          className="text-social-slate-500 text-[10px] mt-1 font-semibold"
          numberOfLines={1}
        >
          {item.author || item.type}
        </Text>
      </View>

      {showChevron && (
        <IconSymbol
          name={chevronIconName}
          size={18}
          color="rgba(255,255,255,0.35)"
        />
      )}

      {onDelete && (
        <Pressable
          onPress={onDelete}
          className="ml-2 w-10 h-10 rounded-full bg-red-500/90 items-center justify-center"
        >
          <IconSymbol name="trash" size={16} color="#fff" />
        </Pressable>
      )}
    </Pressable>
  );
}
