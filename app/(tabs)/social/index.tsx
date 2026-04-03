import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { DownloadProgressModal } from "@/components/ui/download-modal";

import { DownloadSuccessModal } from "@/components/ui/download-succes";

import { useState } from "react";

import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Swipeable } from "react-native-gesture-handler";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

import { useTiktokController } from "@/services/tiktok.service";

import { DialogTiktok } from "@/components/social/tiktok/DialogTiktok";

import { SupportedFormatCards } from "@/components/ui/card";

import { FORMAT_BADGES, PhotoSlideshowDots } from "@/components/ui/helper";

import { DeleteConfirmModal } from "@/components/ui/delete";

import { HistoryCard } from "@/components/ui/history-card";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const { language } = useLanguage();
  const copy = languageData.socialTiktok[language];

  const {
    url,
    setUrl,
    isFetching,
    metadata,
    errorText,
    history,
    isPreviewOpen,
    previewUrl,
    previewLoadPercent,
    previewLoadText,
    isSaving,
    saveText,
    previewWidth,
    photoPreviewIndex,
    coverWidth,
    coverPhotoIndex,
    isDownloadOpen,
    downloadPercent,
    downloadPillText,
    downloadSubText,
    downloadFileName,
    downloadSpeedText,
    downloadRemainingText,
    downloadTotalText,
    isDownloadPaused,
    isDownloadReadyToSave,
    isDownloadSuccessOpen,
    closePreview,
    closeDownloadModal,
    closeDownloadSuccessModal,
    onPaste,
    onFetchResult,
    onPreview,
    onPreviewLayout,
    onCoverLayout,
    onPhotoPreviewScrollEnd,
    onCoverPhotoScrollEnd,
    onClearHistory,
    onDeleteHistoryItem,
    onDownloadVideoMp4,
    onDownloadAudioMp3,
    onDownloadPhotos,
    onTogglePauseOrSave,
    onOpenTikTokApp,
    onShareDownloaded,
  } = useTiktokController();

  const tabBarOffset = 88 + insets.bottom;
  const isPhotoPost = !!metadata?.images?.length;

  return (
    <View className="flex-1 bg-social-bg">
      <DeleteConfirmModal
        visible={isConfirmClearOpen}
        title={copy.deleteHistoryTitle}
        description={copy.deleteHistoryDescription}
        cancelLabel={copy.cancel}
        confirmLabel={copy.delete}
        iconName="history.clear"
        iconColor="#f97373"
        onCancel={() => setIsConfirmClearOpen(false)}
        onConfirm={() => {
          setIsConfirmClearOpen(false);
          void onClearHistory();
        }}
      />
      <DownloadProgressModal
        visible={isDownloadOpen}
        fileName={downloadFileName}
        progressPercent={downloadPercent}
        statusPillText={downloadPillText ?? undefined}
        statusSubText={downloadSubText ?? undefined}
        speedText={downloadSpeedText ?? undefined}
        remainingText={downloadRemainingText ?? undefined}
        downloadedTotalText={
          downloadTotalText ?? (isSaving ? copy.savingVideo : (saveText ?? ""))
        }
        isPaused={isDownloadPaused}
        isSaving={isSaving}
        allowActionWhenCompleted={isDownloadReadyToSave}
        pauseLabel={
          downloadPercent >= 100 && isDownloadReadyToSave
            ? copy.download
            : isDownloadPaused
              ? copy.resumeDownload
              : copy.pauseDownload
        }
        cancelLabel={copy.close}
        onPause={onTogglePauseOrSave}
        onCancel={closeDownloadModal}
        onRequestClose={closeDownloadModal}
      />
      <DownloadSuccessModal
        visible={isDownloadSuccessOpen}
        fileName={downloadFileName}
        sizeText={downloadTotalText ?? undefined}
        speedText={downloadSpeedText ?? undefined}
        durationText={downloadRemainingText ?? "00:00"}
        formatText={
          downloadFileName.toLowerCase().includes("mp3") ? "MP3" : "MP4"
        }
        primaryActionLabel={copy.close}
        secondaryActionLabel={copy.share}
        onPrimaryAction={closeDownloadSuccessModal}
        onSecondaryAction={onShareDownloaded}
        onBack={closeDownloadSuccessModal}
        onRequestClose={closeDownloadSuccessModal}
      />

      <DialogTiktok
        isOpen={isPreviewOpen}
        onClose={closePreview}
        metadata={metadata}
        previewUrl={previewUrl}
        previewLoadPercent={previewLoadPercent}
        previewLoadText={previewLoadText}
        isSaving={isSaving}
        saveText={saveText}
        previewWidth={previewWidth}
        photoPreviewIndex={photoPreviewIndex}
        onPreviewLayout={onPreviewLayout}
        onPhotoPreviewScrollEnd={onPhotoPreviewScrollEnd}
        onDownloadVideoMp4={onDownloadVideoMp4}
        onDownloadAudioMp3={onDownloadAudioMp3}
        onDownloadPhotos={onDownloadPhotos}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarOffset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-6 px-6 mb-10">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="h-0.5 w-8 bg-social-accent" />
            <Text className="font-black text-[10px] tracking-[0.2em] uppercase text-social-accent">
              {copy.platform}
            </Text>
          </View>
          <Text className="text-4xl font-extrabold leading-tight tracking-tight text-white mb-2">
            {copy.title1}
            {"\n"}
            <Text className="text-social-accent">{copy.title2}</Text>
          </Text>

          <View className="flex flex-col gap-6 mt-6">
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder={copy.inputPlaceholder}
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
                  {copy.paste}
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
                      {copy.processing}
                    </Text>
                  ) : (
                    <Text className="font-black text-sm tracking-widest text-white uppercase">
                      {copy.getVideo}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <View className="mt-6">
              <Text className="text-[10px] font-black tracking-widest uppercase text-social-slate-500 mb-4">
                {copy.formats}
              </Text>
              <SupportedFormatCards
                cards={FORMAT_BADGES.map(({ label, icon }) => ({
                  title: label,
                  sub:
                    label === "MP4"
                      ? "Video TikTok berkualitas tinggi"
                      : label === "MP3"
                        ? "Ekstraksi audio dari video TikTok"
                        : "Gambar berkualitas untuk disimpan",
                  icon,
                  fullWidth: false,
                }))}
                containerClassName="flex-row flex-wrap items-center justify-center gap-3 mb-3"
              />
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
                  <View
                    className="w-full aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10"
                    onLayout={onCoverLayout}
                  >
                    {isPhotoPost && (metadata.images ?? []).length ? (
                      <>
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          className="flex-1"
                          onMomentumScrollEnd={onCoverPhotoScrollEnd}
                        >
                          {(metadata.images ?? []).map((uri, idx) => (
                            <View
                              key={`${uri}-${idx}`}
                              style={{
                                width: coverWidth || undefined,
                                height: "100%",
                              }}
                            >
                              <Image
                                source={{ uri }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                              />
                            </View>
                          ))}
                        </ScrollView>

                        <View className="absolute bottom-4 left-0 right-0 items-center px-4">
                          <PhotoSlideshowDots
                            total={(metadata.images ?? []).length}
                            activeIndex={coverPhotoIndex}
                            accentColor={socialPalette.accent}
                          />
                        </View>
                      </>
                    ) : metadata.cover ? (
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
                      {metadata.text?.trim() || copy.tiktokVideoFallback}
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
                          {copy.preview}
                        </Text>
                      </Pressable>
                      {(!!metadata?.videoUrlNoWaterMark ||
                        !!metadata?.videoUrl ||
                        !!previewUrl) &&
                      !isPhotoPost ? (
                        <Pressable
                          onPress={onDownloadVideoMp4}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-full bg-social-accent active:opacity-90 flex-row items-center gap-2"
                          style={{ opacity: isSaving ? 0.6 : 1 }}
                        >
                          <IconSymbol
                            name="arrow.down"
                            size={18}
                            color="#fff"
                          />
                          <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                            {isSaving ? copy.saving : copy.saveMp4}
                          </Text>
                        </Pressable>
                      ) : null}

                      {!!metadata?.images?.length ? (
                        <Pressable
                          onPress={() => void onDownloadPhotos(coverPhotoIndex)}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 active:opacity-90 flex-row items-center gap-2"
                          style={{ opacity: isSaving ? 0.6 : 1 }}
                        >
                          <IconSymbol name="photo" size={18} color="#fff" />
                          <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                            {isSaving ? copy.saving : copy.savePhotos}
                          </Text>
                        </Pressable>
                      ) : null}

                      {!!metadata?.audioUrl ? (
                        <Pressable
                          onPress={onDownloadAudioMp3}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 active:opacity-90 flex-row items-center gap-2"
                          style={{ opacity: isSaving ? 0.6 : 1 }}
                        >
                          <IconSymbol
                            name="music.note"
                            size={18}
                            color="#fff"
                          />
                          <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                            {isSaving ? copy.saving : copy.saveMp3}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="px-6 mb-10">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2 flex-1 mr-3">
              <IconSymbol
                name="history"
                size={24}
                color={socialPalette.accent}
              />
              <Text className="text-2xl font-extrabold italic tracking-tight uppercase text-white shrink">
                {copy.recentHistory}
              </Text>
            </View>
            <Pressable
              onPress={() => setIsConfirmClearOpen(true)}
              disabled={!history?.length}
              className="flex-row items-center gap-1.5 active:opacity-80"
              style={{ opacity: history?.length ? 1 : 0.45 }}
            >
              <IconSymbol
                name="history.clear"
                size={16}
                color={socialPalette.accent}
              />
              <Text
                className="text-[10px] font-black uppercase tracking-widest text-social-accent"
                numberOfLines={1}
              >
                {copy.clearHistory}
              </Text>
            </Pressable>
          </View>
          {history?.length ? (
            <View className="flex flex-col gap-3">
              {history.slice(0, 10).map((item) => (
                <Swipeable
                  key={item.id}
                  overshootRight={false}
                  renderRightActions={() => (
                    <View className="flex-row items-stretch justify-end">
                      <Pressable
                        onPress={() => void onDeleteHistoryItem(item.id)}
                        className="rounded-3xl bg-red-500/90 flex-row items-center justify-center"
                        style={{ width: 72 }}
                      >
                        <IconSymbol name="trash" size={18} color="#fff" />
                      </Pressable>
                    </View>
                  )}
                >
                  <HistoryCard
                    item={item}
                    onPress={() => setUrl(item.url)}
                    chevronIconName="arrow.right"
                    thumbnailVariant="sm"
                    containerClassName="mr-2"
                  />
                </Swipeable>
              ))}
            </View>
          ) : (
            <View className="border-2 border-dashed border-white/5 rounded-3xl py-10 items-center justify-center">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-3 bg-social-accent-faint">
                <IconSymbol
                  name="history"
                  size={28}
                  color={socialPalette.accent}
                />
              </View>
              <Text className="text-slate-500 text-xs font-medium text-center px-4">
                {copy.emptyHistory}
              </Text>
            </View>
          )}
        </View>

        <View className="px-6">
          <View className="rounded-[32px] border border-white/5 overflow-hidden relative">
            <LinearGradient
              colors={["#12131a", "#05060f"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            />

            <IconSymbol
              name="zap"
              size={120}
              color="rgba(255,255,255,0.06)"
              style={{
                position: "absolute",
                right: -16,
                top: -16,
                transform: [{ rotate: "-12deg" }],
              }}
            />

            <View className="p-6">
              <Text className="text-lg font-extrabold text-white">
                {copy.promoTitle}
              </Text>
              <Text className="text-social-slate-500 text-xs mt-1 mb-4 leading-relaxed">
                {copy.promoDesc}
              </Text>

              <Pressable
                onPress={onOpenTikTokApp}
                className="self-start px-6 py-3 rounded-full bg-social-accent active:opacity-90"
              >
                <Text className="text-white font-extrabold text-[10px] tracking-widest uppercase">
                  {copy.promoBtn}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
