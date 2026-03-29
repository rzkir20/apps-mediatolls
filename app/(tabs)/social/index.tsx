import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { PreviewVideo } from "@/components/ui/helper";

import { Dialog } from "@/components/ui/dialog";

import { DownloadProgressModal } from "@/components/ui/download-modal";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

import { useTiktokController } from "@/services/tiktok.service";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const {
    url,
    setUrl,
    isFetching,
    metadata,
    errorText,
    isPreviewOpen,
    previewUrl,
    isSaving,
    saveText,
    isDownloadOpen,
    downloadPercent,
    downloadPillText,
    downloadSubText,
    downloadFileName,
    downloadSpeedText,
    downloadRemainingText,
    downloadTotalText,
    closePreview,
    closeDownloadModal,
    onPaste,
    onFetchResult,
    onPreview,
    onDownloadMp4,
  } = useTiktokController();

  const tabBarOffset = 88 + insets.bottom;

  return (
    <View className="flex-1 bg-social-bg">
      <DownloadProgressModal
        visible={isDownloadOpen}
        fileName={downloadFileName}
        progressPercent={downloadPercent}
        statusPillText={downloadPillText ?? undefined}
        statusSubText={downloadSubText ?? undefined}
        speedText={downloadSpeedText ?? undefined}
        remainingText={downloadRemainingText ?? undefined}
        downloadedTotalText={
          downloadTotalText ?? (isSaving ? "Saving video..." : saveText ?? "")
        }
        isSaving={isSaving}
        cancelLabel="CLOSE"
        onCancel={closeDownloadModal}
        onRequestClose={closeDownloadModal}
      />

      <Dialog
        visible={isPreviewOpen}
        onRequestClose={closePreview}
        title="Preview"
        footer={
          <View className="px-4 py-4">
            <Pressable
              onPress={onDownloadMp4}
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
                  {isSaving ? "Saving..." : "Save to Gallery"}
                </Text>
              </LinearGradient>
            </Pressable>
            {!!saveText && (
              <Text className="text-social-slate-500 text-xs mt-3 font-semibold">
                {saveText}
              </Text>
            )}
          </View>
        }
      >
        {!!previewUrl ? (
          <PreviewVideo uri={previewUrl} isVisible={isPreviewOpen} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </Dialog>

      <View className="px-4 pt-4 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <LinearGradient
            colors={[socialPalette.accent, socialPalette.accentEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: socialPalette.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <IconSymbol name="play.fill" size={20} color="#fff" />
          </LinearGradient>

          <Text className="text-xl font-extrabold tracking-tight text-white">
            MEDIA TOOLS
          </Text>
        </View>
        <Pressable className="w-10 h-10 rounded-full border border-white/10 items-center justify-center bg-white/5 active:opacity-80">
          <IconSymbol
            name="person.circle"
            size={22}
            color="rgba(255,255,255,0.7)"
          />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarOffset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-2 px-6 mb-10">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="h-0.5 w-8 bg-social-accent" />
            <Text className="font-black text-[10px] tracking-[0.2em] uppercase text-social-accent">
              BE DIFFERENT
            </Text>
          </View>
          <Text className="text-4xl font-extrabold leading-tight tracking-tight text-white mb-2">
            Online Video{"\n"}
            <Text className="text-social-accent">Downloader</Text>
          </Text>

          <View className="flex flex-col gap-6 mt-6">
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="Insert TikTok Video Link Here..."
              placeholderTextColor={socialPalette.slate600}
              className="w-full bg-black border border-white/10 rounded-2xl py-5 px-4 text-sm font-medium text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={onPaste}
                className="flex-1 py-4 px-4 rounded-2xl bg-white/5 border border-white/10 flex-row items-center justify-center gap-2 active:opacity-90"
              >
                <IconSymbol
                  name="doc.on.clipboard"
                  size={20}
                  color={socialPalette.slate500}
                />
                <Text className="font-bold text-sm tracking-widest text-white">
                  TEMPEL
                </Text>
              </Pressable>
              <Pressable
                onPress={onFetchResult}
                disabled={isFetching || !url.trim()}
                className="flex-[1.5] rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: isFetching || !url.trim() ? 0.55 : 1 }}
              >
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 52,
                    shadowColor: socialPalette.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {isFetching ? (
                    <Text className="font-black text-sm tracking-widest text-white uppercase">
                      Processing...
                    </Text>
                  ) : (
                    <Text className="font-black text-sm tracking-widest text-white uppercase">
                      Get Video
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            {!!errorText && (
              <View className="mt-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <Text className="text-xs font-semibold text-red-200">
                  {errorText}
                </Text>
              </View>
            )}

            {!!saveText && !isPreviewOpen && (
              <View className="mt-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                <Text className="text-xs font-semibold text-social-slate-500">
                  {saveText}
                </Text>
              </View>
            )}

            {!!metadata && (
              <View className="p-4 rounded-3xl border border-white/10 bg-white/5">
                <View className="flex-col gap-4">
                  <View className="w-full aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                    {metadata.cover ? (
                      <Image
                        source={{ uri: metadata.cover }}
                        style={{ width: "100%", aspectRatio: 1 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <IconSymbol
                          name="photo"
                          size={24}
                          color={socialPalette.slate500}
                        />
                      </View>
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-white font-extrabold text-sm"
                      numberOfLines={2}
                    >
                      {metadata.text?.trim() || "TikTok Video"}
                    </Text>
                    <Text
                      className="text-social-slate-500 text-xs mt-1 font-semibold"
                      numberOfLines={1}
                    >
                      {metadata.author ? `@${metadata.author}` : "TikTok"}
                    </Text>
                    <View className="flex-row gap-2 mt-3">
                      <Pressable
                        onPress={onPreview}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 active:opacity-90 flex-row items-center gap-2"
                      >
                        <IconSymbol
                          name="play.circle"
                          size={18}
                          color={socialPalette.slate500}
                        />
                        <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                          Preview
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={onDownloadMp4}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-full bg-social-accent active:opacity-90 flex-row items-center gap-2"
                        style={{ opacity: isSaving ? 0.6 : 1 }}
                      >
                        <IconSymbol name="arrow.down" size={18} color="#fff" />
                        <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                          {isSaving ? "Saving..." : "Save MP4"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="px-6 mb-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-extrabold italic tracking-tight uppercase text-white">
              Recent <Text className="text-social-accent">History</Text>
            </Text>
            <Pressable>
              <Text className="text-[10px] font-black uppercase tracking-widest text-social-accent">
                Clear History
              </Text>
            </Pressable>
          </View>
          <View className="border-2 border-dashed border-white/5 rounded-3xl py-10 items-center justify-center">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-3 bg-social-accent-faint">
              <IconSymbol
                name="history"
                size={28}
                color={socialPalette.accent}
              />
            </View>
            <Text className="text-slate-500 text-xs font-medium text-center px-4">
              Belum ada riwayat. Isi link TikTok lalu download.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
