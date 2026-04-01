import { Image } from "expo-image";

import React, { useMemo, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { PreviewVideo, historyTypeIconName } from "@/components/ui/helper";

import { Dialog } from "@/components/ui/dialog";

import LoadingMediaPlayer from "@/components/LoadingMediaPlayer";

import { DownloadProgressModal } from "@/components/ui/download-modal";

import { DownloadSuccessModal } from "@/components/ui/download-succes";

import { socialPalette } from "@/lib/pallate";

import { useThreadsController } from "@/services/threads.service";

export default function ThreadsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarOffset = 88 + insets.bottom;

  const c = useThreadsController();
  const [previewWidth, setPreviewWidth] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeSlide = c.videoInfo?.mediaItems?.[c.slideIndex] ?? null;

  const canDownload = useMemo(() => c.url.trim().length > 0, [c.url]);
  const canDownloadSlide = useMemo(
    () => !!activeSlide && !c.isFetching,
    [activeSlide, c.isFetching],
  );

  return (
    <View className="flex-1 bg-social-bg">
      <DownloadProgressModal
        visible={c.isDownloadOpen}
        fileName={c.downloadFileName}
        progressPercent={c.downloadPercent}
        statusPillText={c.downloadPillText ?? undefined}
        statusSubText={c.downloadSubText ?? undefined}
        speedText={c.downloadSpeedText ?? undefined}
        remainingText={c.downloadRemainingText ?? undefined}
        downloadedTotalText={
          c.downloadTotalText ?? (c.isSaving ? "Saving..." : (c.saveText ?? ""))
        }
        isPaused={c.isDownloadPaused}
        isSaving={c.isSaving}
        allowActionWhenCompleted={c.isDownloadReadyToSave}
        pauseLabel={
          c.downloadPercent >= 100 && c.isDownloadReadyToSave
            ? "DOWNLOAD"
            : c.isDownloadPaused
              ? "RESUME DOWNLOAD"
              : "PAUSE DOWNLOAD"
        }
        cancelLabel="CLOSE"
        onPause={c.onTogglePauseOrSave}
        onCancel={c.closeDownloadModal}
        onRequestClose={c.closeDownloadModal}
      />

      <DownloadSuccessModal
        visible={c.isDownloadSuccessOpen}
        fileName={c.downloadFileName}
        sizeText={c.downloadTotalText ?? undefined}
        speedText={c.downloadSpeedText ?? undefined}
        durationText={c.downloadRemainingText ?? "00:00"}
        formatText={activeSlide?.type === "video" ? "MP4" : "JPG"}
        primaryActionLabel="Tutup"
        onPrimaryAction={c.closeDownloadSuccessModal}
        onBack={c.closeDownloadSuccessModal}
        onRequestClose={c.closeDownloadSuccessModal}
      />

      <Dialog
        visible={isPreviewOpen}
        title="Preview"
        onRequestClose={() => setIsPreviewOpen(false)}
        height="82%"
        contentStyle={{ backgroundColor: "#000" }}
        footer={
          <View className="px-4 py-4 border-t border-white/10 bg-black">
            <View className="flex-row gap-3">
              <Pressable
                disabled={!activeSlide}
                onPress={async () => {
                  if (!c.videoInfo) await c.onFetchResult();
                  await c.onDownloadCurrentSlide();
                }}
                className="flex-1 rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: activeSlide ? 1 : 0.55 }}
              >
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 54,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <IconSymbol name="download" size={18} color="#fff" />
                  <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    Download Slide
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => setIsPreviewOpen(false)}
                className="px-5 rounded-2xl bg-white/5 border border-white/10 items-center justify-center active:opacity-90"
              >
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        }
      >
        <View className="flex-1">
          {!!c.videoInfo?.mediaItems?.length ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width ?? 0;
                if (w > 0) setPreviewWidth(w);
              }}
              onMomentumScrollEnd={(e) => {
                const w = e.nativeEvent.layoutMeasurement.width || 1;
                const x = e.nativeEvent.contentOffset.x || 0;
                c.setSlideIndex(Math.max(0, Math.round(x / w)));
              }}
            >
              {c.videoInfo.mediaItems.map((slide, idx) => (
                <View
                  key={`${slide.url}-${idx}`}
                  style={{ width: previewWidth || undefined }}
                  className="flex-1"
                >
                  {slide.type === "video" ? (
                    <PreviewVideo
                      uri={slide.previewUrl}
                      isVisible={isPreviewOpen && idx === c.slideIndex}
                    />
                  ) : (
                    <Image
                      source={{ uri: slide.previewUrl }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="contain"
                    />
                  )}
                </View>
              ))}
            </ScrollView>
          ) : c.isFetching ? (
            <LoadingMediaPlayer
              progressPercent={45}
              statusText="Menyiapkan preview..."
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-xs font-bold text-social-slate-500">
                Belum ada preview.
              </Text>
            </View>
          )}

          {!!c.videoInfo?.mediaItems?.length && (
            <View className="absolute bottom-4 left-0 right-0 items-center">
              <View className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-black/50 border border-white/10">
                <Text className="text-[10px] font-black uppercase tracking-widest text-white/80">
                  Slide {c.slideIndex + 1} / {c.videoInfo.mediaItems.length}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Dialog>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarOffset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-4 mb-8 px-5">
          <Text className="font-cabinet text-3xl font-black tracking-tight mb-2 text-white">
            Thread <Text className="text-social-accent">Downloader</Text>
          </Text>
          <Text className="text-social-slate-500 text-sm font-medium">
            Unduh video dan gambar dari Threads dengan kualitas terbaik.
          </Text>
        </View>

        <View className="px-5 mb-8">
          <View className="flex flex-col gap-3">
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <IconSymbol
                  name="layers"
                  size={20}
                  color={socialPalette.accent}
                />
              </View>
              <TextInput
                value={c.url}
                onChangeText={c.setUrl}
                placeholder="Tempel link Threads di sini..."
                placeholderTextColor={socialPalette.slate600}
                className="w-full h-16 pl-12 pr-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-medium text-white"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => void c.onPaste()}
                className="flex-1 py-4 px-4 rounded-2xl bg-white/5 border border-white/10 flex-row items-center justify-center gap-2 active:opacity-90"
              >
                <IconSymbol
                  name="doc.on.clipboard"
                  size={18}
                  color={socialPalette.slate500}
                />
                <Text className="font-bold text-xs tracking-widest text-white uppercase">
                  Tempel
                </Text>
              </Pressable>

              <Pressable
                disabled={!canDownload || c.isFetching}
                onPress={() => void c.onFetchResult()}
                className="flex-[1.5] rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: !canDownload || c.isFetching ? 0.55 : 1 }}
              >
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 56,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 10,
                    shadowColor: socialPalette.accent,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <IconSymbol name="info" size={18} color="#fff" />
                  <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    Ambil Metadata
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-5 mb-8">
          <View className="rounded-[32px] p-5 bg-white/[0.03] border border-white/10">
            <View className="flex-row items-center gap-3 mb-4">
              <Image
                source={{
                  uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-bold text-white">threads</Text>
                  <IconSymbol
                    name="checkmark"
                    size={14}
                    color={socialPalette.accent}
                  />
                </View>
                <Text className="text-[11px] font-medium text-social-slate-500">
                  {c.isFetching
                    ? "Mengambil data..."
                    : c.videoInfo
                      ? "Siap diunduh"
                      : "Masukkan link lalu ambil metadata"}
                </Text>
              </View>
              <Pressable
                onPress={() => void c.onFetchResult()}
                disabled={!canDownload || c.isFetching}
                className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:opacity-80"
                style={{ opacity: !canDownload || c.isFetching ? 0.5 : 1 }}
              >
                <IconSymbol
                  name="info"
                  size={18}
                  color={socialPalette.slate500}
                />
              </Pressable>
            </View>

            <View className="mb-5">
              <Text className="text-[13px] leading-relaxed text-slate-200 mb-4">
                {c.videoInfo?.text?.trim() ||
                  "Preview akan muncul setelah metadata berhasil diambil."}
              </Text>

              {activeSlide ? (
                <View className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900">
                  <View
                    onLayout={(e) => {
                      const w = e.nativeEvent.layout.width ?? 0;
                      if (w > 0) setPreviewWidth(w);
                    }}
                  >
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(e) => {
                        const w = e.nativeEvent.layoutMeasurement.width || 1;
                        const x = e.nativeEvent.contentOffset.x || 0;
                        c.setSlideIndex(Math.max(0, Math.round(x / w)));
                      }}
                    >
                      {(c.videoInfo?.mediaItems ?? []).map((slide, idx) => (
                        <View
                          key={`${slide.url}-${idx}`}
                          style={{ width: previewWidth || undefined }}
                        >
                          {slide.type === "video" ? (
                            <PreviewVideo
                              uri={slide.previewUrl}
                              isVisible={idx === c.slideIndex}
                            />
                          ) : (
                            <Image
                              source={{ uri: slide.previewUrl }}
                              style={{ width: "100%", height: 280 }}
                              contentFit="cover"
                            />
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  {!!c.videoInfo?.mediaItems?.length && (
                    <View className="flex-row items-center justify-between px-4 py-3 border-t border-white/10 bg-black/30">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        Slide {c.slideIndex + 1} /{" "}
                        {c.videoInfo.mediaItems.length}
                      </Text>
                      <Text className="text-[10px] font-bold text-social-slate-500">
                        Swipe kiri/kanan
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="h-[220px] rounded-2xl bg-white/[0.03] border border-white/10 items-center justify-center">
                  <Text className="text-xs font-bold text-social-slate-500">
                    Belum ada preview
                  </Text>
                </View>
              )}

              {!!c.errorText && (
                <Text className="text-xs font-bold text-red-400 mt-3">
                  {c.errorText}
                </Text>
              )}
              {!!c.saveText && (
                <Text className="text-xs font-bold text-social-slate-500 mt-3">
                  {c.saveText}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-6 pt-4 border-t border-white/5">
              <View className="flex-row items-center gap-1.5">
                <IconSymbol
                  name={historyTypeIconName(
                    c.videoInfo?.mediaItems?.some((m) => m.type === "video")
                      ? "Video"
                      : "Image",
                  )}
                  size={20}
                  color={socialPalette.slate500}
                />
                <Text className="text-[11px] font-bold text-social-slate-500">
                  {c.videoInfo?.mediaItems?.length ?? 0} item
                </Text>
              </View>
              <View className="flex-1" />
              <Pressable
                onPress={() => void c.onFetchResult()}
                disabled={!canDownload || c.isFetching}
                className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:opacity-80"
                style={{ opacity: !canDownload || c.isFetching ? 0.5 : 1 }}
              >
                <IconSymbol
                  name="arrow.clockwise"
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-5 mb-8">
          <View className="flex-row gap-3 mb-3">
            <Pressable
              disabled={!canDownload || c.isFetching}
              onPress={() => {
                setIsPreviewOpen(true);
                void c.onFetchResult().then((data) => {
                  if (data) c.setSlideIndex(0);
                });
              }}
              className="flex-1 py-4 px-4 rounded-2xl bg-white/5 border border-white/10 flex-row items-center justify-center gap-2 active:opacity-90"
              style={{ opacity: !canDownload ? 0.55 : 1 }}
            >
              <IconSymbol
                name="play.circle"
                size={18}
                color={socialPalette.slate500}
              />
              <Text className="font-bold text-xs tracking-widest text-white uppercase">
                Preview
              </Text>
            </Pressable>
          </View>

          <Pressable
            disabled={!canDownloadSlide}
            onPress={async () => {
              if (!c.videoInfo) await c.onFetchResult();
              await c.onDownloadCurrentSlide();
            }}
            className="w-full rounded-2xl overflow-hidden active:opacity-90 mt-3"
            style={{ opacity: canDownloadSlide ? 1 : 0.55 }}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <IconSymbol name="download" size={20} color="#fff" />
              <Text className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Download Slide Aktif
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View className="px-5 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-cabinet font-extrabold uppercase tracking-widest text-white">
              Riwayat Terakhir
            </Text>
            <Pressable
              onPress={() => c.openConfirmClearHistory()}
              disabled={!c.history.length}
              className="active:opacity-80"
              style={{ opacity: c.history.length ? 1 : 0.5 }}
            >
              <Text className="text-[10px] font-bold text-social-accent uppercase tracking-widest">
                Hapus Riwayat
              </Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {c.history.slice(0, 10).map((item) => (
              <View
                key={item.id}
                className="rounded-2xl p-3 flex-row items-center gap-4 bg-white/[0.03] border border-white/10"
              >
                <View className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/5">
                  <Image
                    source={{ uri: item.cover }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-xs font-bold text-white"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-[10px] text-social-slate-500 font-medium mt-1">
                    {item.type}
                  </Text>
                </View>
                <Pressable
                  onPress={async () => {
                    c.setUrl(item.url);
                    await c.onFetchResult();
                  }}
                  className="w-8 h-8 rounded-lg bg-white/5 items-center justify-center active:opacity-80"
                >
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color={socialPalette.slate500}
                  />
                </Pressable>
              </View>
            ))}
            {!c.history.length && (
              <View className="rounded-2xl p-4 bg-white/[0.03] border border-white/10">
                <Text className="text-xs font-bold text-social-slate-500">
                  Belum ada riwayat.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
