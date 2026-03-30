import { Image } from "expo-image";

import { LinearGradient } from "expo-linear-gradient";

import { DownloadProgressModal } from "@/components/ui/download-modal";

import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { DialogYoutube } from "@/components/social/youtube/DialogYoutube";

import { socialPalette } from "@/lib/pallate";

import { useYoutubeController } from "@/services/youtube.service";

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

const SUPPORTED_FORMAT_CARDS = [
  {
    title: "MP4 / 720p",
    sub: "Standard HD",
    icon: "tv" as const,
    fullWidth: false,
  },
  {
    title: "MP4 / 1080p",
    sub: "Full High Def",
    icon: "monitor" as const,
    fullWidth: false,
  },
  {
    title: "MP3 Audio Only",
    sub: "High Quality 320kbps Extraction",
    icon: "music.note" as const,
    fullWidth: true,
  },
];

export default function YoutubeScreen() {
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
    isSaving,
    saveText,
    selectedFormatIndex,
    setSelectedFormatIndex,
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
    onClearHistory,
    closePreview,
    closeDownloadModal,
    onPaste,
    onFetchResult,
    onPreview,
    onDownloadVideoMp4,
    onDownloadAudioMp3,
    onTogglePauseOrSave,
  } = useYoutubeController();

  const tabBarOffset = 88 + insets.bottom;
  const audioAvailable = !!videoInfo?.audioUrl;

  const onOpenYoutubeApp = async () => {
    const candidates = ["youtube://www.youtube.com", "vnd.youtube://"];
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
    await Linking.openURL("https://www.youtube.com/");
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

      <DialogYoutube
        isOpen={isPreviewOpen}
        onClose={closePreview}
        previewUrl={previewUrl}
        audioAvailable={audioAvailable}
        isSaving={isSaving}
        saveText={saveText}
        onDownloadVideoMp4={onDownloadVideoMp4}
        onDownloadAudioMp3={onDownloadAudioMp3}
      />

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
          <Text className="text-4xl font-extrabold leading-tight tracking-tight text-white mb-8">
            Download YouTube{"\n"}
            <Text className="text-social-accent">Video</Text>
          </Text>

          <View className="flex flex-col gap-4">
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="Insert YouTube Video Link Here..."
              placeholderTextColor={socialPalette.slate600}
              className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={onPaste}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 flex-row items-center justify-center gap-2 active:opacity-90"
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
                disabled={isFetching || !canFetch}
                className="flex-[1.5] rounded-2xl overflow-hidden active:opacity-90"
                style={{ opacity: isFetching || !canFetch ? 0.55 : 1 }}
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
                      Download
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            <View className="mt-6">
              <Text className="text-[10px] font-black text-social-slate-500 tracking-widest uppercase mb-4">
                Supported Formats:
              </Text>
              <View className="flex-row gap-3 mb-3">
                {SUPPORTED_FORMAT_CARDS.filter((c) => !c.fullWidth).map(
                  (card) => (
                    <View
                      key={card.title}
                      className="flex-1 flex-row items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5"
                    >
                      <View className="w-8 h-8 rounded-lg bg-social-accent-faint items-center justify-center">
                        <IconSymbol
                          name={card.icon}
                          size={20}
                          color={socialPalette.accent}
                        />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text
                          className="text-xs font-bold text-white"
                          numberOfLines={1}
                        >
                          {card.title}
                        </Text>
                        <Text className="text-[10px] text-social-slate-500 mt-0.5">
                          {card.sub}
                        </Text>
                      </View>
                    </View>
                  ),
                )}
              </View>
              {SUPPORTED_FORMAT_CARDS.filter((c) => c.fullWidth).map(
                (card) => (
                  <View
                    key={card.title}
                    className="flex-row items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5"
                  >
                    <View className="w-8 h-8 rounded-lg bg-social-accent-faint items-center justify-center">
                      <IconSymbol
                        name={card.icon}
                        size={20}
                        color={socialPalette.accent}
                      />
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="text-xs font-bold text-white">
                        {card.title}
                      </Text>
                      <Text className="text-[10px] text-social-slate-500 mt-0.5">
                        {card.sub}
                      </Text>
                    </View>
                  </View>
                ),
              )}
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
                          name="brand.youtube"
                          size={40}
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
                      {metadata.title?.trim() || "YouTube"}
                    </Text>
                    {!!metadata.duration && (
                      <Text className="text-social-slate-500 text-xs mt-1 font-semibold">
                        {metadata.duration}
                      </Text>
                    )}

                    {!!videoInfo?.formatOptions?.length ? (
                      <View className="mt-3">
                        <Text className="text-[10px] font-black text-social-slate-500 tracking-widest uppercase mb-2">
                          Quality
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{
                            flexDirection: "row",
                            gap: 8,
                          }}
                        >
                          {videoInfo.formatOptions.map((opt, idx) => {
                            const active = idx === selectedFormatIndex;
                            return (
                              <Pressable
                                key={`${opt.label}-${idx}`}
                                onPress={() => setSelectedFormatIndex(idx)}
                                className="px-3 py-2 rounded-full border"
                                style={
                                  active
                                    ? {
                                        backgroundColor: socialPalette.accent,
                                        borderColor: socialPalette.accent,
                                      }
                                    : {
                                        borderColor: "rgba(255,255,255,0.15)",
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                      }
                                }
                              >
                                <Text
                                  className={`text-[10px] font-black tracking-widest uppercase ${
                                    active ? "text-white" : "text-slate-400"
                                  }`}
                                >
                                  {opt.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    ) : null}

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
                        className="px-4 py-2 rounded-full bg-social-accent active:opacity-90 flex-row items-center gap-2"
                        style={{ opacity: isSaving || !videoInfo ? 0.6 : 1 }}
                      >
                        <IconSymbol
                          name="arrow.down"
                          size={18}
                          color="#fff"
                        />
                        <Text className="text-white text-[10px] font-black tracking-widest uppercase">
                          {isSaving ? "Saving..." : "Save MP4"}
                        </Text>
                      </Pressable>
                      {audioAvailable ? (
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
                            {isSaving ? "Saving..." : "Save MP3"}
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
                Recent <Text className="text-social-accent">History</Text>
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
                color={socialPalette.accent}
              />
              <Text
                className="text-[10px] font-black uppercase tracking-widest text-social-accent"
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
                          <IconSymbol
                            name={typeIcon}
                            size={12}
                            color="#fff"
                          />
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
            <View className="border-2 border-dashed border-white/5 rounded-3xl py-10 items-center justify-center">
              <View className="w-12 h-12 rounded-full items-center justify-center mb-3 bg-social-accent-faint">
                <IconSymbol
                  name="history"
                  size={28}
                  color={socialPalette.accent}
                />
              </View>
              <Text className="text-slate-500 text-xs font-medium text-center px-10 leading-relaxed">
                Belum ada riwayat. Tempel link YouTube lalu klik download.
              </Text>
            </View>
          )}
        </View>

        <View className="px-6 mb-24">
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
                VideoMAX Pro
              </Text>
              <Text className="text-social-slate-500 text-xs mt-1 mb-4 leading-relaxed">
                Explore our premium downloader for faster multi-thread
                downloading.
              </Text>

              <Pressable
                onPress={onOpenYoutubeApp}
                className="self-start px-6 py-3 rounded-full bg-social-accent active:opacity-90"
              >
                <Text className="text-white font-extrabold text-[10px] tracking-widest uppercase">
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
