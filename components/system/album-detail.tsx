import { Image } from "expo-image";

import React, { useMemo } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

import { socialPalette } from "@/lib/pallate";

import { useRouter } from "expo-router";

import { useSystemAlbumDetail } from "@/services/system.service";

export function AlbumDetail({ platformKey, title }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const copy = languageData.system[language];

  const resolvedTitle = useMemo(() => {
    if (title) return title;
    return platformKey
      ? `${platformKey}`.replace(/^\w/, (m) => m.toUpperCase())
      : "Album";
  }, [platformKey, title]);

  const {
    searchText,
    setSearchText,
    loading,
    assetsLoading,
    filteredAssets,
    albumAssetCount,
    hasNextPage,
    loadNextPage,
    sizeTextById,
  } = useSystemAlbumDetail(platformKey);

  const mediaTypeBadge = (
    mediaType: string,
  ): { label: string; icon: IconSymbolName } => {
    if (mediaType === "photo") return { label: "Foto", icon: "photo" };
    if (mediaType === "video") return { label: "Video", icon: "movie" };
    if (mediaType === "audio") return { label: "Audio", icon: "music.note" };
    return { label: "File", icon: "doc.text" };
  };

  return (
    <View className="flex-1 bg-social-bg">
      <View className="px-6 pt-4 pb-4 flex-row items-center gap-2">
        <Pressable
          onPress={() => router.back()}
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
          {resolvedTitle}
        </Text>
      </View>

      <ScrollContainer
        style={{ paddingBottom: insets.bottom }}
        className="flex-1"
      >
        <View className="px-6 mt-2">
          <View className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex-row items-center gap-3 mb-4">
            <IconSymbol
              name="search"
              size={18}
              color={socialPalette.slate500}
            />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={copy.searchPlaceholder}
              placeholderTextColor={socialPalette.slate600}
              className="flex-1 text-sm font-medium text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-black uppercase tracking-widest text-slate-500">
              {copy.files}
            </Text>
            {!!albumAssetCount ? (
              <Text className="text-xs font-medium text-slate-500">
                {albumAssetCount} items
              </Text>
            ) : null}
          </View>

          {loading ? (
            <View className="rounded-[32px] bg-white/5 border border-white/10 p-6 items-center justify-center">
              <ActivityIndicator color={socialPalette.accent} />
              <Text className="text-xs font-bold text-slate-500 mt-2">
                {copy.loading}
              </Text>
            </View>
          ) : filteredAssets.length === 0 ? (
            <View className="rounded-[32px] bg-white/5 border border-white/10 p-6 items-center justify-center">
              <Text className="text-xs font-bold text-slate-500">
                {copy.noFolders}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredAssets}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
              columnWrapperStyle={{ gap: 12 }}
              renderItem={({ item }) => {
                const badge = mediaTypeBadge(item?.mediaType);
                const sizeText = sizeTextById[String(item?.id ?? "")];
                return (
                  <View className="flex-1">
                    <View className="rounded-[32px] bg-white/5 border border-white/10 p-4">
                      <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-11 h-11 rounded-2xl bg-white/5 items-center justify-center">
                          <IconSymbol
                            name={badge.icon}
                            size={18}
                            color="#fff"
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-[11px] font-bold text-white"
                            numberOfLines={1}
                          >
                            {item?.filename ?? "Untitled"}
                          </Text>
                          <Text className="text-[9px] font-black uppercase tracking-widest text-social-accent mt-1">
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-[10px] font-medium text-slate-500">
                        {sizeText ?? "—"}
                      </Text>

                      {item?.mediaType === "photo" ? (
                        <Image
                          source={{ uri: item.uri }}
                          style={{
                            width: "100%",
                            height: 84,
                            marginTop: 10,
                            borderRadius: 14,
                          }}
                          contentFit="cover"
                        />
                      ) : null}
                    </View>
                  </View>
                );
              }}
              onEndReached={() => {
                if (hasNextPage && !assetsLoading) loadNextPage();
              }}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                assetsLoading ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator color={socialPalette.accent} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScrollContainer>
    </View>
  );
}

function ScrollContainer({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: any;
  className?: string;
}) {
  // local wrapper to keep JSX smaller
  return (
    <View style={style} className={className}>
      {children}
    </View>
  );
}
