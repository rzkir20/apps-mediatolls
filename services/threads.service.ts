import { useCallback, useEffect, useMemo, useRef } from "react";

import * as Clipboard from "expo-clipboard";

import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig, withApiSecret } from "@/lib/config";

import { getErrorMessage } from "@/components/logs";

import { getPlatformAlbumName } from "@/components/ui/helper";

export const PLATFORM = "threads";

const uiKey = ["threads", "ui"] as const;
const historyKey = ["threads", "history"] as const;

const STORAGE_KEY_THREADS_HISTORY = "threads:history:v1";
const HISTORY_LIMIT = 30;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function loadHistory(): Promise<HistoryItem[]> {
  const parsed = safeJsonParse<HistoryItem[]>(
    await AsyncStorage.getItem(STORAGE_KEY_THREADS_HISTORY),
  );
  return Array.isArray(parsed) ? parsed : [];
}

async function persistHistory(items: HistoryItem[]) {
  await AsyncStorage.setItem(
    STORAGE_KEY_THREADS_HISTORY,
    JSON.stringify(items.slice(0, HISTORY_LIMIT)),
  );
}

function formatBytes(n: number) {
  const v = Number.isFinite(n) ? Math.max(0, n) : 0;
  const mb = v / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function formatSeconds(s: number) {
  if (!Number.isFinite(s) || s < 0) return "--:--";
  const total = Math.round(s);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function getDefaultUiState(): ThreadsUiState {
  return {
    url: "",
    slideIndex: 0,
    isConfirmClearOpen: false,

    isDownloadOpen: false,
    downloadPercent: 0,
    downloadPillText: null,
    downloadSubText: null,
    downloadFileName: "Download",
    downloadSpeedText: null,
    downloadRemainingText: null,
    downloadTotalText: null,
    isDownloadPaused: false,
    isDownloadReadyToSave: false,
    isDownloadSuccessOpen: false,

    saveText: null,
  };
}

function normalizeThreadSlides(data: ThreadMetadataResponse): ThreadApiMediaItem[] {
  if (data.mediaItems?.length) return data.mediaItems;
  const v = typeof data.videoUrl === "string" ? data.videoUrl.trim() : "";
  if (v) return [{ type: "video", url: v }];
  return [];
}

function sliceTypeLabel(slides: ThreadApiMediaItem[]): HistoryItem["type"] {
  const hasVid = slides.some((m) => m.type === "video");
  const hasImg = slides.some((m) => m.type === "image");
  return hasVid && !hasImg ? "Video" : "Image";
}

function buildThreadsVideoInfo(
  data: ThreadMetadataResponse,
  baseUrl: string,
): ThreadsVideoInfo {
  const slides = normalizeThreadSlides(data);

  const mediaItems: ThreadsMediaItemWithPreview[] = slides.map((it) => ({
    type: it.type,
    url: it.url,
    previewUrl: withApiSecret(
      `${baseUrl}/api/${PLATFORM}/${it.type === "video" ? "preview-video" : "preview-image"}?mediaUrl=${encodeURIComponent(it.url)}`,
    ),
  }));

  const primaryVideoUrl =
    slides.find((m) => m.type === "video")?.url ??
    (typeof data.videoUrl === "string" ? data.videoUrl.trim() : "") ??
    undefined;

  const images = slides
    .filter((m) => m.type === "image")
    .map((m) => m.url)
    .filter(Boolean);

  const cover =
    slides.find((m) => m.type === "image")?.url ??
    images[0] ??
    (primaryVideoUrl || undefined);

  return {
    videoUrl: primaryVideoUrl || undefined,
    previewVideoUrl: primaryVideoUrl
      ? withApiSecret(
          `${baseUrl}/api/${PLATFORM}/preview-video?mediaUrl=${encodeURIComponent(primaryVideoUrl)}`,
        )
      : undefined,
    images: images.length ? images : undefined,
    cover,
    previewImageUrls: images.length
      ? images.map((u) =>
          withApiSecret(
            `${baseUrl}/api/${PLATFORM}/preview-image?mediaUrl=${encodeURIComponent(u)}`,
          ),
        )
      : undefined,
    text: typeof data.caption === "string" ? data.caption : undefined,
    author: undefined,
    mediaItems: mediaItems.length ? mediaItems : undefined,
  };
}

export function useThreadsController() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();

  const historyHydratedRef = useRef(false);
  const downloadRef = useRef<ReturnType<
    typeof FileSystem.createDownloadResumable
  > | null>(null);
  const downloadedFileUrisRef = useRef<string[]>([]);
  const progressRef = useRef<{
    lastTs: number;
    lastBytes: number;
    speedBps: number;
  } | null>(null);

  const ui = useQuery({
    queryKey: uiKey,
    queryFn: async () => getDefaultUiState(),
    initialData: getDefaultUiState(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const history = useQuery({
    queryKey: historyKey,
    queryFn: loadHistory,
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const url = ui.data.url;
  const slideIndex = ui.data.slideIndex;
  const isConfirmClearOpen = ui.data.isConfirmClearOpen;

  const isDownloadOpen = ui.data.isDownloadOpen;
  const downloadPercent = ui.data.downloadPercent;
  const downloadPillText = ui.data.downloadPillText;
  const downloadSubText = ui.data.downloadSubText;
  const downloadFileName = ui.data.downloadFileName;
  const downloadSpeedText = ui.data.downloadSpeedText;
  const downloadRemainingText = ui.data.downloadRemainingText;
  const downloadTotalText = ui.data.downloadTotalText;
  const isDownloadPaused = ui.data.isDownloadPaused;
  const isDownloadReadyToSave = ui.data.isDownloadReadyToSave;
  const isDownloadSuccessOpen = ui.data.isDownloadSuccessOpen;
  const saveText = ui.data.saveText;

  const setUi = useCallback(
    (patch: Partial<ThreadsUiState>) => {
      qc.setQueryData<ThreadsUiState>(uiKey, (prev) => ({
        ...(prev ?? getDefaultUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const setUrl = useCallback((next: string) => setUi({ url: next }), [setUi]);

  const setSlideIndex = useCallback(
    (next: number) => setUi({ slideIndex: Math.max(0, next) }),
    [setUi],
  );

  const setHistory = useCallback(
    async (next: HistoryItem[] | ((prev: HistoryItem[]) => HistoryItem[])) => {
      const current = qc.getQueryData<HistoryItem[]>(historyKey) ?? [];
      const value =
        typeof next === "function"
          ? (next as (p: HistoryItem[]) => HistoryItem[])(current)
          : next;
      const trimmed = value.slice(0, HISTORY_LIMIT);
      qc.setQueryData<HistoryItem[]>(historyKey, trimmed);
      await persistHistory(trimmed);
    },
    [qc],
  );

  useEffect(() => {
    if (historyHydratedRef.current) return;
    historyHydratedRef.current = true;
    void loadHistory().then((items) => {
      qc.setQueryData<HistoryItem[]>(historyKey, items.slice(0, HISTORY_LIMIT));
    });
  }, [qc]);

  const pushHistory = useCallback(
    async (meta: ThreadMetadataResponse, originUrl: string) => {
      const trimmedUrl = originUrl.trim();
      if (!trimmedUrl) return;

      const slides = normalizeThreadSlides(meta);
      const cover =
        slides.find((m) => m.type === "image")?.url ??
        slides[0]?.url ??
        (typeof meta.videoUrl === "string" ? meta.videoUrl.trim() : "") ??
        "";

      const title =
        (typeof meta.caption === "string" ? meta.caption : "")
          .trim()
          .slice(0, 80) || "Threads Post";

      const item: HistoryItem = {
        id: String(Date.now()),
        url: trimmedUrl,
        title,
        author: undefined,
        cover,
        type: sliceTypeLabel(slides),
        date: Date.now(),
      };

      await setHistory((prev) => {
        const deduped = prev.filter((x) => x.url !== trimmedUrl);
        return [item, ...deduped];
      });
    },
    [setHistory],
  );

  const historyItems = history.data ?? [];
  const historyLength = historyItems.length;

  const openConfirmClearHistory = useCallback(() => {
    if (!historyLength) return;
    setUi({ isConfirmClearOpen: true });
  }, [historyLength, setUi]);

  const closeConfirmClearHistory = useCallback(() => {
    setUi({ isConfirmClearOpen: false });
  }, [setUi]);

  const onClearHistory = useCallback(async () => {
    qc.setQueryData<HistoryItem[]>(historyKey, []);
    await AsyncStorage.removeItem(STORAGE_KEY_THREADS_HISTORY);
  }, [qc]);

  const onConfirmClearHistory = useCallback(async () => {
    closeConfirmClearHistory();
    await onClearHistory();
  }, [closeConfirmClearHistory, onClearHistory]);

  const canFetch = useMemo(() => !!url.trim() && !!baseUrl, [url, baseUrl]);

  const metadataQuery = useQuery({
    queryKey: ["threads", "metadata", baseUrl, url.trim()] as const,
    queryFn: async () => {
      const trimmed = url.trim();
      const res = await fetch(
        `${baseUrl}/api/${PLATFORM}/metadata?url=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as ThreadMetadataResponse | ErrorShape;

      if (!res.ok) {
        const msg =
          (data as ErrorShape).message ??
          (data as ErrorShape).error ??
          "Gagal mengambil data";
        throw new Error(msg);
      }

      return data as ThreadMetadataResponse;
    },
    enabled: false,
    retry: false,
  });

  const metadata = metadataQuery.data ?? null;
  const isFetching = metadataQuery.isFetching;

  const errorText = metadataQuery.error
    ? getErrorMessage(metadataQuery.error, "Terjadi kesalahan")
    : null;

  const videoInfo = useMemo(() => {
    if (!metadata || !baseUrl) return null;
    return buildThreadsVideoInfo(metadata, baseUrl);
  }, [metadata, baseUrl]);

  useEffect(() => {
    const len = videoInfo?.mediaItems?.length ?? 0;
    if (len > 0 && slideIndex >= len) {
      setSlideIndex(Math.max(0, len - 1));
    }
  }, [videoInfo?.mediaItems?.length, slideIndex, setSlideIndex, videoInfo]);

  const onPaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUi({ url: text.trim() });
  }, [setUi]);

  const onFetchResult = useCallback(async (): Promise<ThreadMetadataResponse | null> => {
    const trimmed = url.trim();
    if (!trimmed || isFetching || !baseUrl) return null;
    setUi({ saveText: null, slideIndex: 0 });
    const res = await metadataQuery.refetch();
    const data = res.data;
    if (data) {
      await pushHistory(data, trimmed);
    }
    return data ?? null;
  }, [url, isFetching, baseUrl, metadataQuery, setUi, pushHistory]);

  const downloadSingleMutation = useMutation({
    mutationKey: ["threads", "download", "single", baseUrl, url.trim()],
    mutationFn: async (args: {
      downloadUrl: string;
      ext: "mp4" | "jpg";
      suggestedName?: string;
    }) => {
      const { downloadUrl, ext } = args;
      if (!downloadUrl) throw new Error("URL download tidak tersedia");

      const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDir) throw new Error("Cache directory tidak tersedia");

      const fileNameSafe = `threads-${Date.now()}.${ext}`;
      const fileUri = `${cacheDir}${fileNameSafe}`;

      const startedAt = Date.now();
      progressRef.current = { lastTs: startedAt, lastBytes: 0, speedBps: 0 };

      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        { cache: true },
        (p) => {
          const written = p.totalBytesWritten ?? 0;
          const expected = p.totalBytesExpectedToWrite ?? 0;

          const now = Date.now();
          const prev = progressRef.current;
          if (prev) {
            const dt = Math.max(0.25, (now - prev.lastTs) / 1000);
            const db = Math.max(0, written - prev.lastBytes);
            const inst = db / dt;
            prev.speedBps = prev.speedBps ? prev.speedBps * 0.7 + inst * 0.3 : inst;
            prev.lastTs = now;
            prev.lastBytes = written;
          }

          const pct = expected > 0 ? Math.round((written / expected) * 100) : 0;
          const spd = progressRef.current?.speedBps ?? 0;
          const remainingSec =
            spd > 0 && expected > 0 ? (expected - written) / spd : NaN;

          setUi({
            downloadPercent: Math.max(0, Math.min(100, pct)),
            downloadPillText: "Downloading",
            downloadSpeedText: spd > 0 ? `${formatBytes(spd)}/s` : null,
            downloadRemainingText: Number.isFinite(remainingSec)
              ? formatSeconds(remainingSec)
              : null,
            downloadTotalText:
              expected > 0 ? `${formatBytes(written)} / ${formatBytes(expected)}` : null,
          });
        },
      );

      downloadRef.current = downloadResumable;
      const file = await downloadResumable.downloadAsync();
      if (!file?.uri) throw new Error("Download gagal");

      downloadedFileUrisRef.current = [file.uri];
      setUi({
        downloadPercent: 100,
        downloadPillText: "Ready",
        downloadSubText: "Tap DOWNLOAD untuk simpan",
        downloadRemainingText: "00:00",
        isDownloadReadyToSave: true,
      });

      return file.uri;
    },
    onMutate: async () => {
      downloadedFileUrisRef.current = [];
      setUi({ saveText: null });
    },
    onError: (e) => {
      setUi({ saveText: getErrorMessage(e, "Gagal download") });
    },
  });

  const saveToGalleryMutation = useMutation({
    mutationKey: ["threads", "save", "gallery", baseUrl, url.trim()],
    mutationFn: async () => {
      const uris = downloadedFileUrisRef.current;
      if (!uris.length) throw new Error("File belum siap");

      const current = await MediaLibrary.getPermissionsAsync();
      if (current.status !== "granted") {
        const res = await MediaLibrary.requestPermissionsAsync(true, [
          "video",
          "photo",
          "audio",
        ] as any);
        if (res.status !== "granted") {
          throw new Error("Izin penyimpanan ditolak.");
        }
      }

      setUi({ downloadPillText: "Saving" });

      const assets = [];
      for (const uri of uris) {
        assets.push(await MediaLibrary.createAssetAsync(uri));
      }

      const albumName = getPlatformAlbumName(PLATFORM);
      const first = assets[0];
      if (!first) throw new Error("Gagal membuat asset");

      const album = await MediaLibrary.createAlbumAsync(
        albumName,
        first,
        false,
      ).catch(async () => {
        const found = await MediaLibrary.getAlbumAsync(albumName);
        if (!found) throw new Error("Gagal membuat album");
        return found;
      });

      if (assets.length > 1) {
        await MediaLibrary.addAssetsToAlbumAsync(
          assets.slice(1),
          album,
          false,
        ).catch(() => {});
      }

      return assets;
    },
    onSuccess: () => {
      setUi({
        saveText: "Berhasil disimpan ke Gallery.",
        downloadPillText: "Completed",
        downloadSubText: "Saved to Gallery",
        isDownloadOpen: false,
        isDownloadSuccessOpen: true,
      });
    },
    onError: (e) => {
      const msg = getErrorMessage(e, "Gagal menyimpan");
      setUi({
        saveText: msg,
        downloadPillText: "Failed",
        downloadSubText: msg,
      });
    },
  });

  const isSaving = saveToGalleryMutation.isPending;

  const startDownloadUi = useCallback(
    (args: { fileName: string }) => {
      setUi({
        downloadFileName: args.fileName,
        downloadPercent: 0,
        downloadPillText: "Preparing",
        downloadSubText: null,
        isDownloadOpen: true,
        downloadSpeedText: null,
        downloadRemainingText: null,
        downloadTotalText: null,
        isDownloadPaused: false,
        isDownloadReadyToSave: false,
        isDownloadSuccessOpen: false,
      });
    },
    [setUi],
  );

  const onDownloadCurrentSlide = useCallback(async () => {
    const items = videoInfo?.mediaItems ?? [];
    const slide = items[slideIndex];
    if (!slide) {
      setUi({ saveText: "Slide tidak tersedia." });
      return;
    }

    const title = videoInfo?.text?.trim()?.slice(0, 80);
    const baseName = title || "Threads Media";
    startDownloadUi({ fileName: baseName });

    if (!baseUrl || isSaving) return;

    const ext = slide.type === "video" ? "mp4" : "jpg";
    const downloadUrl = withApiSecret(
      `${baseUrl}/api/${PLATFORM}/${slide.type === "video" ? "download-video" : "download-image"}?mediaUrl=${encodeURIComponent(slide.url)}`,
    );

    try {
      await downloadSingleMutation.mutateAsync({ downloadUrl, ext });
    } catch (e) {
      const msg = getErrorMessage(e, "Gagal download");
      setUi({
        downloadPercent: 100,
        downloadPillText: "Failed",
        downloadSubText: msg,
      });
      throw e;
    }
  }, [
    videoInfo,
    slideIndex,
    startDownloadUi,
    baseUrl,
    isSaving,
    downloadSingleMutation,
    setUi,
  ]);

  const closeDownloadModal = useCallback(() => {
    downloadRef.current?.cancelAsync().catch(() => {});
    downloadRef.current = null;
    downloadedFileUrisRef.current = [];
    progressRef.current = null;
    setUi({
      isDownloadOpen: false,
      isDownloadPaused: false,
      isDownloadReadyToSave: false,
    });
  }, [setUi]);

  const closeDownloadSuccessModal = useCallback(() => {
    setUi({ isDownloadSuccessOpen: false });
  }, [setUi]);

  const onTogglePauseOrSave = useCallback(async () => {
    if (downloadPercent >= 100 && isDownloadReadyToSave) {
      await saveToGalleryMutation.mutateAsync();
      return;
    }

    const t = downloadRef.current;
    if (!t) return;

    if (isDownloadPaused) {
      await t.resumeAsync();
      setUi({
        isDownloadPaused: false,
        downloadPillText: "Downloading",
        downloadSubText: null,
      });
      return;
    }

    await t.pauseAsync();
    setUi({
      isDownloadPaused: true,
      downloadPillText: "Paused",
      downloadSubText: null,
    });
  }, [
    downloadPercent,
    isDownloadReadyToSave,
    isDownloadPaused,
    saveToGalleryMutation,
    setUi,
  ]);

  return {
    baseUrl,

    url,
    setUrl,
    canFetch,

    slideIndex,
    setSlideIndex,

    isFetching,
    metadata,
    videoInfo,
    errorText,

    history: historyItems,
    isConfirmClearOpen,
    openConfirmClearHistory,
    closeConfirmClearHistory,
    onConfirmClearHistory,

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
    isSaving,
    saveText,

    closeDownloadModal,
    closeDownloadSuccessModal,
    onPaste,
    onFetchResult,
    onDownloadCurrentSlide,
    onTogglePauseOrSave,
  };
}
