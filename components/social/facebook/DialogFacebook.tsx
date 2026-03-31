import * as React from "react";

import { LinearGradient } from "expo-linear-gradient";

import { PreviewVideo } from "@/components/ui/helper";

import LoadingMediaPlayer from "@/components/LoadingMediaPlayer";

import { Dialog } from "@/components/ui/dialog";

import { Pressable, Text, View } from "react-native";

import { socialPalette } from "@/lib/pallate";

const FB_BLUE = "#1877F2";

export function DialogFacebook({
  isOpen,
  onClose,
  previewUrl,
  previewLoadPercent,
  previewLoadText,
  isSaving,
  saveText,
  onDownloadVideoMp4,
}: DialogFacebookProps) {
  return (
    <Dialog
      visible={isOpen}
      onRequestClose={onClose}
      title="Preview"
      footer={
        <View className="px-4 py-4">
          <View className="flex flex-col gap-3">
            {!!previewUrl && (
              <Pressable
                onPress={onDownloadVideoMp4}
                disabled={isSaving}
                className="w-full rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: isSaving ? 0.6 : 1 }}
              >
                <LinearGradient
                  colors={[socialPalette.accent, FB_BLUE]}
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
          </View>
          {!!saveText && (
            <Text className="text-social-slate-500 text-xs mt-3 font-semibold">
              {saveText}
            </Text>
          )}
        </View>
      }
    >
      {!!previewUrl ? (
        <PreviewVideo key={previewUrl} uri={previewUrl} isVisible={isOpen} />
      ) : (
        <LoadingMediaPlayer
          progressPercent={previewLoadPercent}
          statusText={previewLoadText ?? saveText ?? "Menyiapkan preview..."}
        />
      )}
    </Dialog>
  );
}
