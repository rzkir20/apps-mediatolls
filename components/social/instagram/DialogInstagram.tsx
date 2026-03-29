import * as React from "react";

import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { PreviewVideo } from "@/components/ui/helper";

import { Dialog } from "@/components/ui/dialog";

import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { socialPalette } from "@/lib/pallate";

export function DialogInstagram({
  isOpen,
  onClose,
  metadata,
  previewUrl,
  isSaving,
  saveText,
  onDownloadVideoMp4,
  onDownloadPhotos,
}: DialogInstagramProps) {
  const isPhotoPost = !!metadata?.images?.length;
  const [previewWidth, setPreviewWidth] = React.useState(0);
  const [photoPreviewIndex, setPhotoPreviewIndex] = React.useState(0);

  const onPreviewLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setPreviewWidth(w);
  };

  const onPhotoPreviewScrollEnd = (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const w = previewWidth || 0;
    if (!w) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / w);
    setPhotoPreviewIndex(Math.max(0, idx));
  };

  return (
    <Dialog
      visible={isOpen}
      onRequestClose={onClose}
      title="Preview"
      footer={
        <View className="px-4 py-4">
          <View className="flex flex-col gap-3">
            {(!!metadata?.videoUrl || !!previewUrl) && !isPhotoPost && (
              <Pressable
                onPress={onDownloadVideoMp4}
                disabled={isSaving}
                className="w-full rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: isSaving ? 0.6 : 1 }}
              >
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                  }}
                >
                  <Text className="font-black text-xs tracking-widest text-white uppercase">
                    {isSaving ? "Saving..." : "Download MP4"}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            {!!metadata?.images?.length && (
              <Pressable
                onPress={onDownloadPhotos}
                disabled={isSaving}
                className="w-full rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: isSaving ? 0.6 : 1 }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.06)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.10)",
                    borderRadius: 16,
                  }}
                >
                  <Text className="font-black text-xs tracking-widest text-white uppercase">
                    {isSaving ? "Saving..." : "Download Photos"}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
          {!!saveText && (
            <Text className="text-social-slate-500 text-xs mt-3 font-semibold">
              {saveText}
            </Text>
          )}
        </View>
      }
    >
      {isPhotoPost ? (
        <View className="flex-1" onLayout={onPreviewLayout}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            onMomentumScrollEnd={onPhotoPreviewScrollEnd}
          >
            {(metadata?.images ?? []).map((uri, idx) => (
              <View
                key={`${uri}-${idx}`}
                style={{ width: previewWidth || undefined, flex: 1 }}
              >
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </View>
            ))}
          </ScrollView>

          <View className="absolute bottom-3 left-0 right-0 items-center">
            <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-black/40 border border-white/10">
              {(metadata?.images ?? []).map((_, idx) => {
                const active = idx === photoPreviewIndex;
                return (
                  <View
                    key={`dot-${idx}`}
                    className="rounded-full"
                    style={{
                      width: active ? 18 : 7,
                      height: 7,
                      backgroundColor: active
                        ? socialPalette.accent
                        : "rgba(255,255,255,0.35)",
                      opacity: active ? 1 : 0.9,
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>
      ) : !!previewUrl ? (
        <PreviewVideo uri={previewUrl} isVisible={isOpen} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </Dialog>
  );
}
