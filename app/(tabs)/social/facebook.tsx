import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { DownloadProgressModal } from "@/components/ui/download-modal";

import { DownloadSuccessModal } from "@/components/ui/download-succes";

import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { DialogFacebook } from "@/components/social/facebook/DialogFacebook";

import { socialPalette } from "@/lib/pallate";

import { useFacebookController } from "@/services/facebook.service";

function historyTypeIconName(
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

const FB_BLUE = "#1877F2";

const FORMAT_BADGES = [
  { label: "MP4", icon: "file.mp4" as const, tint: socialPalette.accent },
  { label: "MOV", icon: "video" as const, tint: FB_BLUE },
  { label: "MP3", icon: "file.mp3" as const, tint: "#fb923c" },
] as const;

export default function FacebookScreen() {
  const insets = useSafeAreaInsets();

  const {
    url,
    setUrl,
    canFetch,
    isFetching,
    metadata,
    videoInfo,
    errorText,
    history,
    isPreviewOpen,
    previewUrl,
    previewLoadPercent,
    previewLoadText,
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
    isDownloadPaused,
    isDownloadReadyToSave,
    isDownloadSuccessOpen,
    onClearHistory,
    closePreview,
    closeDownloadModal,
    closeDownloadSuccessModal,
    onPaste,
    onFetchResult,
    onPreview,
    onDownloadVideoMp4,
    onTogglePauseOrSave,
  } = useFacebookController();

  const tabBarOffset = 88 + insets.bottom;

  const onOpenFacebookApp = async () => {
    const candidates = ["fb://", "facebook://", "fb://feed"];
    for (const u of candidates) {
      try {
        const supported = await Linking.canOpenURL(u);
        if (supported) {
          await Linking.openURL(u);
          return;
        }
      } catch {
        /* continue */
      }
    }
    await Linking.openURL("https://www.facebook.com/");
  };

  const onShareDownloaded = async () => {
    const shareText =
      saveText?.trim() ||
      `Download selesai: ${downloadFileName || "Media dari Media Tools"}`;
    try {
      await Share.share({ message: shareText });
    } catch {
      // noop
    }
  };

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
          downloadTotalText ?? (isSaving ? "Saving..." : (saveText ?? ""))
        }
        isPaused={isDownloadPaused}
        isSaving={isSaving}
        allowActionWhenCompleted={isDownloadReadyToSave}
        pauseLabel={
          downloadPercent >= 100 && isDownloadReadyToSave
            ? "DOWNLOAD"
            : isDownloadPaused
              ? "RESUME DOWNLOAD"
              : "PAUSE DOWNLOAD"
        }
        cancelLabel="CLOSE"
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
        formatText="MP4"
        primaryActionLabel="Tutup"
        secondaryActionLabel="Bagikan"
        onPrimaryAction={closeDownloadSuccessModal}
        onSecondaryAction={onShareDownloaded}
        onBack={closeDownloadSuccessModal}
        onRequestClose={closeDownloadSuccessModal}
      />

      <DialogFacebook
        isOpen={isPreviewOpen}
        onClose={closePreview}
        previewUrl={previewUrl}
        previewLoadPercent={previewLoadPercent}
        previewLoadText={previewLoadText}
        isSaving={isSaving}
        saveText={saveText}
        onDownloadVideoMp4={onDownloadVideoMp4}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarOffset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand glows */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 260,
            height: 260,
            backgroundColor: "rgba(255,61,87,0.10)",
            borderRadius: 999,
            opacity: 1,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 320,
            left: -140,
            width: 320,
            height: 320,
            backgroundColor: "rgba(24,119,242,0.06)",
            borderRadius: 999,
            opacity: 1,
          }}
        />

        {/* Hero */}
        <View className="mt-6 px-6 mb-10">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              style={{
                height: 2,
                width: 40,
                backgroundColor: socialPalette.accent,
              }}
            />
            <Text
              className="font-black text-[10px] tracking-[0.3em] uppercase"
              style={{ color: socialPalette.accent }}
            >
              Facebook Premium
            </Text>
          </View>

          <Text className="text-5xl font-extrabold leading-[52px] tracking-tight text-white mb-6">
            Facebook{"\n"}
            <Text style={{ color: FB_BLUE }}>Video Downloader</Text>
          </Text>

          {/* Glass input card */}
          <View className="p-2 rounded-[32px] bg-white/[0.03] border border-white/10 overflow-hidden">
            <View className="p-2">
              <View className="relative">
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="Paste Facebook video link..."
                  placeholderTextColor={socialPalette.slate600}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-medium text-white"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View className="absolute right-5 top-1/2 -translate-y-1/2">
                  <IconSymbol name="brand.facebook" size={22} color={FB_BLUE} />
                </View>
              </View>

              <View className="flex-row gap-3 mt-3">
                <Pressable
                  onPress={onPaste}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 flex-row items-center justify-center gap-2 active:opacity-90"
                >
                  <IconSymbol
                    name="doc.on.clipboard"
                    size={20}
                    color={FB_BLUE}
                  />
                  <Text className="font-black text-[11px] tracking-widest text-white">
                    PASTE
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onFetchResult}
                  disabled={isFetching || !canFetch}
                  className="flex-[1.8] rounded-2xl overflow-hidden active:opacity-90"
                  style={{ opacity: isFetching || !canFetch ? 0.55 : 1 }}
                >
                  <LinearGradient
                    colors={[socialPalette.accent, FB_BLUE]}
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
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      elevation: 4,
                    }}
                  >
                    <Text className="font-black text-[11px] tracking-[3px] text-white uppercase">
                      {isFetching ? "Processing..." : "Download Now"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Formats */}
          <View className="mt-8">
            <Text className="text-[10px] font-black text-social-slate-500 tracking-[0.3em] uppercase mb-4">
              Available Formats
            </Text>
            <View className="flex-row gap-3">
              {FORMAT_BADGES.map((b) => (
                <View
                  key={b.label}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 flex-row items-center justify-center gap-2"
                >
                  <IconSymbol name={b.icon} size={18} color={b.tint} />
                  <Text className="text-xs font-black text-white">
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {!!errorText && (
            <View className="mt-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20">
              <Text className="text-xs font-semibold text-red-200">
                {errorText}
              </Text>
            </View>
          )}

          {!!saveText && !isPreviewOpen && (
            <View className="mt-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Text className="text-xs font-semibold text-social-slate-500">
                {saveText}
              </Text>
            </View>
          )}

          {/* Result card */}
          {!!metadata && (
            <View className="mt-6 p-4 rounded-3xl border border-white/10 bg-white/5">
              <View className="flex-col gap-4">
                <View className="w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                  {metadata.thumbnail ? (
                    <Image
                      source={{ uri: metadata.thumbnail }}
                      style={{ width: "100%", aspectRatio: 16 / 9 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      className="items-center justify-center bg-black/50"
                      style={{ aspectRatio: 16 / 9 }}
                    >
                      <IconSymbol
                        name="brand.facebook"
                        size={40}
                        color={FB_BLUE}
                      />
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <Text
                    className="text-white font-extrabold text-sm"
                    numberOfLines={2}
                  >
                    {metadata.title?.trim() || "Facebook Video"}
                  </Text>
                  {!!metadata.duration && (
                    <Text className="text-social-slate-500 text-xs mt-1 font-semibold">
                      {metadata.duration}
                    </Text>
                  )}

                  <View className="flex-row flex-wrap gap-2 mt-3">
                    <Pressable
                      onPress={onPreview}
                      disabled={!videoInfo?.previewVideoUrl}
                      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 active:opacity-90 flex-row items-center gap-2"
                      style={{
                        opacity: videoInfo?.previewVideoUrl ? 1 : 0.45,
                      }}
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
                      onPress={onDownloadVideoMp4}
                      disabled={isSaving || !videoInfo}
                      className="px-4 py-2 rounded-full active:opacity-90 flex-row items-center gap-2"
                      style={{
                        backgroundColor: socialPalette.accent,
                        opacity: isSaving || !videoInfo ? 0.6 : 1,
                      }}
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

        {/* History */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2 flex-1 mr-3">
              <Text className="text-2xl font-extrabold italic tracking-tight uppercase text-white shrink">
                Recent{" "}
                <Text style={{ color: socialPalette.accent }}>History</Text>
              </Text>
            </View>
            <Pressable
              onPress={onClearHistory}
              disabled={!history?.length}
              className="flex-row items-center gap-1.5 active:opacity-80"
              style={{ opacity: history?.length ? 1 : 0.45 }}
            >
              <IconSymbol
                name="history.clear"
                size={16}
                color={socialPalette.slate500}
              />
              <Text
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: socialPalette.slate500 }}
                numberOfLines={1}
              >
                Clear History
              </Text>
            </Pressable>
          </View>

          {history?.length ? (
            <View className="flex flex-col gap-3">
              {history.slice(0, 10).map((item) => {
                const typeIcon = historyTypeIconName(item.type);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setUrl(item.url)}
                    className="flex-row items-center gap-3 p-3 rounded-3xl bg-white/5 border border-white/10 active:opacity-90"
                  >
                    <View className="w-14 h-14 rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative">
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
                      <Text
                        className="text-white font-extrabold text-xs"
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="text-social-slate-500 text-[10px] mt-1 font-semibold"
                        numberOfLines={1}
                      >
                        {item.author || item.type}
                      </Text>
                    </View>

                    <IconSymbol
                      name="arrow.right"
                      size={18}
                      color="rgba(255,255,255,0.35)"
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="border-2 border-dashed border-white/5 rounded-[40px] py-10 items-center justify-center bg-black/20">
              <View className="w-14 h-14 rounded-full items-center justify-center mb-4 bg-white/5 border border-white/10">
                <IconSymbol
                  name="history"
                  size={28}
                  color={socialPalette.slate500}
                />
              </View>
              <Text className="text-slate-500 text-[11px] font-bold px-10 text-center leading-relaxed tracking-wide uppercase">
                Start downloading your favorite Facebook content to see history
                here.
              </Text>
            </View>
          )}
        </View>

        {/* Promo */}
        <View className="px-6 mb-24">
          <View className="rounded-[40px] border border-white/10 overflow-hidden relative">
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
                bottom: -16,
                transform: [{ rotate: "-12deg" }],
              }}
            />

            <View className="p-8">
              <View
                className="self-start flex-row items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{ backgroundColor: "rgba(255,61,87,0.10)" }}
              >
                <IconSymbol
                  name="sparkles"
                  size={14}
                  color={socialPalette.accent}
                />
                <Text
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: socialPalette.accent }}
                >
                  RECOMMENDED
                </Text>
              </View>

              <Text className="text-2xl font-extrabold text-white mb-2">
                VideoMAX Pro
              </Text>
              <Text className="text-social-slate-500 text-xs mb-6 leading-relaxed max-w-[220px]">
                Unlock lightning fast downloads for private Facebook groups and
                high-res reels.
              </Text>

              <Pressable
                onPress={onOpenFacebookApp}
                className="self-start px-8 py-4 rounded-2xl bg-white active:opacity-90"
              >
                <Text className="text-black font-black text-[10px] tracking-[0.2em] uppercase">
                  Explore Now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
