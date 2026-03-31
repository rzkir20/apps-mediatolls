import { useCallback, useEffect, useMemo, useRef } from "react";

import * as Clipboard from "expo-clipboard";

import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/lib/config";

import { getErrorMessage } from "@/components/logs";

const uiKey = ["youtube", "ui"] as const;
const historyKey = ["youtube", "history"] as const;
const STORAGE_KEY_YOUTUBE_HISTORY = "youtube:history:v1";
const HISTORY_LIMIT = 30;
const PLATFORM = "youtube";

function getPreviewCacheUri(cacheDir: string, requestUrl: string) {
  const key = encodeURIComponent(requestUrl).replace(/%/g, "").slice(0, 120);
  return `${cacheDir}preview-youtube-${key}.mp4`;
}

type YoutubeUiState = {
  url: string;

  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  saveText: string | null;

  selectedFormatIndex: number;

  isDownloadOpen: boolean;
  downloadPercent: number;
  downloadPillText: string | null;
  downloadSubText: string | null;
  downloadFileName: string;

  downloadSpeedText: string | null;
  downloadRemainingText: string | null;
  downloadTotalText: string | null;

  isDownloadPaused: boolean;
  isDownloadReadyToSave: boolean;
  isDownloadSuccessOpen: boolean;
};

function getDefaultUiState(): YoutubeUiState {
  return {
    url: "",

    isPreviewOpen: false,
    previewUrl: null,
    previewLoadPercent: 0,
    previewLoadText: null,
    saveText: null,

    selectedFormatIndex: 0,

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
  };
}

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
    await AsyncStorage.getItem(STORAGE_KEY_YOUTUBE_HISTORY),
  );
  return Array.isArray(parsed) ? parsed : [];
}

async function persistHistory(items: HistoryItem[]) {
  await AsyncStorage.setItem(
    STORAGE_KEY_YOUTUBE_HISTORY,
    JSON.stringify(items),
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

function parseQuality(label: string | null): number {
  if (!label || typeof label !== "string") return 0;
  const m = label.match(/^(\d+)/);
  return m?.[1] != null ? parseInt(m[1], 10) : 0;
}

function getItag(format: YoutubeFormatItem): number {
  const raw = (format as { itag?: number }).itag;
  return Number.isFinite(raw) ? Number(raw) : 0;
}

function buildVideoInfo(
  data: YoutubeMetadataResponse,
  baseUrl: string,
  url: string,
): VideoInfo {
  const formats = data.formats ?? [];
  const hasVideo = formats.some((f) => !f.isAudioOnly);
  const hasAudio = formats.some((f) => f.isAudioOnly);

  const videoFormats = formats
    .filter((f) => !f.isAudioOnly)
    .sort(
      (a, b) =>
        parseQuality(b.qualityLabel ?? null) -
          parseQuality(a.qualityLabel ?? null) ||
        getItag(b) - getItag(a),
    );

  const seenItags = new Set<number>();
  const formatOptions: { index: number; label: string }[] = [];
  for (const f of videoFormats) {
    const itag = getItag(f);
    if (seenItags.has(itag)) continue;
    seenItags.add(itag);
    const label = f.qualityLabel ?? `Itag ${itag}`;
    formatOptions.push({ index: itag, label });
  }

  const trimmedUrl = url.trim();
  const previewVideoUrl = hasVideo
    ? `${baseUrl}/api/${PLATFORM}/preview-video?url=${encodeURIComponent(trimmedUrl)}`
    : undefined;

  return {
    videoUrl: undefined,
    videoUrlHd: undefined,
    qualities: undefined,
    formatOptions: formatOptions.length ? formatOptions : undefined,
    previewVideoUrl,
    audioUrl: hasAudio ? "available" : undefined,
    images: undefined,
    cover: data.thumbnail ?? undefined,
    previewImageUrls: undefined,
    text: data.title ?? undefined,
    author: undefined,
    duration: data.duration ?? undefined,
    durationMs: data.durationSeconds ?? undefined,
    id: data.id ?? undefined,
  };
}

type DownloadKind = "video" | "audio";

export function useYoutubeController() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadRef = useRef<ReturnType<
    typeof FileSystem.createDownloadResumable
  > | null>(null);
  const downloadedFileUrisRef = useRef<string[]>([]);
  const downloadKindRef = useRef<DownloadKind>("video");
  const historyHydratedRef = useRef(false);
  const previewDownloadRef = useRef<ReturnType<
    typeof FileSystem.createDownloadResumable
  > | null>(null);
  const previewRequestIdRef = useRef(0);
  const previewCacheRef = useRef<Record<string, string>>({});
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
  const isPreviewOpen = ui.data.isPreviewOpen;
  const previewUrl = ui.data.previewUrl;
  const previewLoadPercent = ui.data.previewLoadPercent;
  const previewLoadText = ui.data.previewLoadText;
  const saveText = ui.data.saveText;
  const selectedFormatIndex = ui.data.selectedFormatIndex;

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

  const setUi = useCallback(
    (patch: Partial<YoutubeUiState>) => {
      qc.setQueryData<YoutubeUiState>(uiKey, (prev) => ({
        ...(prev ?? getDefaultUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const setUrl = useCallback((next: string) => setUi({ url: next }), [setUi]);

  const setSelectedFormatIndex = useCallback(
    (next: number) => setUi({ selectedFormatIndex: Math.max(0, next) }),
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
    async (meta: YoutubeMetadataResponse, originUrl: string) => {
      const trimmedUrl = originUrl.trim();
      if (!trimmedUrl) return;

      const item: HistoryItem = {
        id: String(Date.now()),
        url: trimmedUrl,
        title: meta.title?.trim()?.slice(0, 80) || "YouTube Video",
        author: undefined,
        cover: meta.thumbnail ?? "",
        type: "Video",
        date: Date.now(),
      };

      await setHistory((prev) => {
        const deduped = prev.filter((x) => x.url !== trimmedUrl);
        return [item, ...deduped];
      });
    },
    [setHistory],
  );

  const onClearHistory = useCallback(async () => {
    previewRequestIdRef.current += 1;
    previewDownloadRef.current?.cancelAsync().catch(() => {});
    previewDownloadRef.current = null;

    const cachedPreviewUris = Array.from(
      new Set(Object.values(previewCacheRef.current)),
    ).filter(Boolean);
    previewCacheRef.current = {};

    if (cachedPreviewUris.length) {
      await Promise.allSettled(
        cachedPreviewUris.map((uri) =>
          FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}),
        ),
      );
    }

    qc.setQueryData<HistoryItem[]>(historyKey, []);
    await AsyncStorage.removeItem(STORAGE_KEY_YOUTUBE_HISTORY);
    setUi({
      isPreviewOpen: false,
      previewUrl: null,
      previewLoadPercent: 0,
      previewLoadText: null,
      saveText: null,
    });
  }, [qc, setUi]);

  const canFetch = useMemo(() => !!url.trim() && !!baseUrl, [url, baseUrl]);

  const metadataQuery = useQuery({
    queryKey: ["youtube", "metadata", baseUrl, url.trim()] as const,
    queryFn: async () => {
      const trimmed = url.trim();
      const res = await fetch(
        `${baseUrl}/api/${PLATFORM}/metadata?url=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as YoutubeMetadataResponse | ErrorShape;

      if (!res.ok) {
        const msg =
          (data as ErrorShape).message ??
          (data as ErrorShape).error ??
          "Gagal mengambil data";
        throw new Error(msg);
      }

      return data as YoutubeMetadataResponse;
    },
    enabled: false,
    retry: false,
  });

  const errorText = metadataQuery.error
    ? getErrorMessage(metadataQuery.error, "Terjadi kesalahan")
    : null;

  const metadata = metadataQuery.data ?? null;
  const isFetching = metadataQuery.isFetching;

  const videoInfo = useMemo(() => {
    if (!metadata || !baseUrl || !url.trim()) return null;
    return buildVideoInfo(metadata, baseUrl, url);
  }, [metadata, baseUrl, url]);

  useEffect(() => {
    const opts = videoInfo?.formatOptions;
    if (opts?.length && opts[0]) {
      setSelectedFormatIndex(opts[0].index);
    }
  }, [videoInfo?.formatOptions, setSelectedFormatIndex]);

  const effectivePreviewVideoUrl = useMemo(() => {
    const info = videoInfo;
    if (!info?.previewVideoUrl) return null;
    const opts = info.formatOptions;
    if (opts?.length) {
      const selectedItag =
        opts.find((o) => o.index === selectedFormatIndex)?.index ??
        opts[0]?.index;
      if (selectedItag == null) return info.previewVideoUrl;
      return `${info.previewVideoUrl}&quality=${encodeURIComponent(String(selectedItag))}`;
    }
    return info.previewVideoUrl;
  }, [videoInfo, selectedFormatIndex]);

  const onPaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUi({ url: text.trim() });
  }, [setUi]);

  const onFetchResult = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || isFetching || !baseUrl) return;
    setUi({ saveText: null, selectedFormatIndex: 0 });
    const res = await metadataQuery.refetch();
    const data = res.data;
    if (data) {
      await pushHistory(data, trimmed);
    }
  }, [url, isFetching, baseUrl, metadataQuery, setUi, pushHistory]);

  const onPreview = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!baseUrl) {
      setUi({
        saveText:
          "API URL belum diset. Isi EXPO_PUBLIC_API_URL (mis: http://192.168.x.x:3000) lalu reload aplikasi.",
      });
      return;
    }

    const info = videoInfo;
    if (!info?.previewVideoUrl) {
      setUi({
        saveText: "Video tidak tersedia untuk pratinjau.",
      });
      return;
    }

    const opts = info.formatOptions;
    let u = info.previewVideoUrl;
    if (opts?.length) {
      const selectedItag =
        opts.find((o) => o.index === selectedFormatIndex)?.index ??
        opts[0]?.index;
      if (selectedItag != null) {
        u = `${info.previewVideoUrl}&quality=${encodeURIComponent(String(selectedItag))}`;
      }
    }

    const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!cacheDir) {
      setUi({ saveText: "Cache directory tidak tersedia." });
      return;
    }
    const cacheKey = `${trimmed}::${selectedFormatIndex}`;
    const fromRef = previewCacheRef.current[cacheKey];
    if (fromRef) {
      const info = await FileSystem.getInfoAsync(fromRef);
      if (info.exists && !info.isDirectory) {
        setUi({
          previewUrl: fromRef,
          isPreviewOpen: true,
          previewLoadPercent: 100,
          previewLoadText: "Siap diputar (cache)",
          saveText: null,
        });
        return;
      }
      delete previewCacheRef.current[cacheKey];
    }

    const previewUri = getPreviewCacheUri(cacheDir, u);
    const cachedInfo = await FileSystem.getInfoAsync(previewUri);
    if (cachedInfo.exists && !cachedInfo.isDirectory) {
      previewCacheRef.current[cacheKey] = previewUri;
      setUi({
        previewUrl: previewUri,
        isPreviewOpen: true,
        previewLoadPercent: 100,
        previewLoadText: "Siap diputar (cache)",
        saveText: null,
      });
      return;
    }

    previewRequestIdRef.current += 1;
    const requestId = previewRequestIdRef.current;
    previewDownloadRef.current?.cancelAsync().catch(() => {});
    previewDownloadRef.current = null;
    setUi({
      previewUrl: null,
      isPreviewOpen: true,
      previewLoadPercent: 0,
      previewLoadText: "Menghubungi server...",
      saveText: null,
    });
    try {
      const task = FileSystem.createDownloadResumable(
        u,
        previewUri,
        { cache: true },
        (p) => {
          if (previewRequestIdRef.current !== requestId) return;
          const written = p.totalBytesWritten ?? 0;
          const expected = p.totalBytesExpectedToWrite ?? 0;
          if (expected > 0) {
            const pct = Math.round((written / expected) * 100);
            setUi({
              previewLoadPercent: Math.max(0, Math.min(99, pct)),
              previewLoadText: "Mengunduh preview...",
            });
            return;
          }
          qc.setQueryData<YoutubeUiState>(uiKey, (prev) => {
            const current = prev ?? getDefaultUiState();
            return {
              ...current,
              previewLoadPercent: Math.min(95, current.previewLoadPercent + 2),
              previewLoadText: "Mengunduh preview...",
            };
          });
        },
      );
      previewDownloadRef.current = task;
      const file = await task.downloadAsync();
      if (previewRequestIdRef.current !== requestId) return;
      if (!file?.uri) throw new Error("Gagal menyiapkan preview video");
      previewCacheRef.current[cacheKey] = file.uri;
      setUi({
        previewUrl: file.uri,
        isPreviewOpen: true,
        previewLoadPercent: 100,
        previewLoadText: "Siap diputar",
        saveText: null,
      });
    } catch (e) {
      if (previewRequestIdRef.current !== requestId) return;
      setUi({
        isPreviewOpen: false,
        previewUrl: null,
        previewLoadPercent: 0,
        previewLoadText: null,
        saveText: getErrorMessage(e, "Gagal memuat preview video"),
      });
    } finally {
      if (previewRequestIdRef.current === requestId)
        previewDownloadRef.current = null;
    }
  }, [url, baseUrl, videoInfo, selectedFormatIndex, qc, setUi]);

  const closePreview = useCallback(() => {
    previewRequestIdRef.current += 1;
    previewDownloadRef.current?.cancelAsync().catch(() => {});
    previewDownloadRef.current = null;
    setUi({
      isPreviewOpen: false,
      previewLoadPercent: 0,
      previewLoadText: null,
    });
  }, [setUi]);

  const closeDownloadModal = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
    downloadRef.current?.cancelAsync().catch(() => {});
    downloadRef.current = null;
    downloadedFileUrisRef.current = [];
    downloadKindRef.current = "video";
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

  const downloadSingleMutation = useMutation({
    mutationKey: ["youtube", "download", "single", baseUrl, url.trim()],
    mutationFn: async (args: { downloadUrl: string; ext: "mp4" | "mp3" }) => {
      const { downloadUrl, ext } = args;
      if (!downloadUrl) throw new Error("URL download tidak tersedia");

      const cacheDir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDir) throw new Error("Cache directory tidak tersedia");

      const fileNameSafe = `youtube-${Date.now()}.${ext}`;
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
            prev.speedBps = prev.speedBps
              ? prev.speedBps * 0.7 + inst * 0.3
              : inst;
            prev.lastTs = now;
            prev.lastBytes = written;
          }

          const pct = expected > 0 ? Math.round((written / expected) * 100) : 0;
          const spd = progressRef.current?.speedBps ?? 0;
          const remainingSec =
            spd > 0 && expected > 0 ? (expected - written) / spd : NaN;
          const stageText =
            pct < 15
              ? "Preparing Stream"
              : pct < 70
                ? "Saving Media Data"
                : pct < 85
                  ? "Optimizing Video"
                  : pct < 100
                    ? "Verifying Assets"
                    : "Done";

          setUi({
            downloadPercent: Math.max(0, Math.min(100, pct)),
            downloadPillText: "Downloading",
            downloadSubText: stageText,
            downloadSpeedText: spd > 0 ? `${formatBytes(spd)}/s` : null,
            downloadRemainingText: Number.isFinite(remainingSec)
              ? formatSeconds(remainingSec)
              : null,
            downloadTotalText:
              expected > 0
                ? `${formatBytes(written)} / ${formatBytes(expected)}`
                : null,
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
    mutationKey: ["youtube", "save", "gallery", baseUrl, url.trim()],
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

      const albumName = "Media Tools";
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
    (args: { fileName: string; kind: DownloadKind }) => {
      downloadKindRef.current = args.kind;
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

  const onDownloadVideoMp4 = useCallback(async () => {
    const info = videoInfo;
    const title = metadata?.title?.trim();
    const baseName = info?.id ? `youtube_${info.id}` : "youtube_video";
    startDownloadUi({ fileName: title || baseName, kind: "video" });

    if (!url.trim() || !baseUrl || isSaving || !info) return;
    try {
      const trimmed = url.trim();
      const opts = info.formatOptions;
      const qualityItag =
        opts?.find((o) => o.index === selectedFormatIndex)?.index ??
        opts?.[0]?.index ??
        0;
      const params = new URLSearchParams({ url: trimmed });
      params.set("quality", String(qualityItag));
      const downloadUrl = `${baseUrl}/api/${PLATFORM}/download?${params.toString()}`;
      await downloadSingleMutation.mutateAsync({
        downloadUrl,
        ext: "mp4",
      });
    } catch (e) {
      const msg = getErrorMessage(e, "Gagal download video");
      setUi({
        downloadPercent: 100,
        downloadPillText: "Failed",
        downloadSubText: msg,
      });
      throw e;
    }
  }, [
    metadata,
    videoInfo,
    startDownloadUi,
    url,
    baseUrl,
    isSaving,
    selectedFormatIndex,
    downloadSingleMutation,
    setUi,
  ]);

  const onDownloadAudioMp3 = useCallback(async () => {
    const info = videoInfo;
    const title = metadata?.title?.trim();
    const baseName = info?.id ? `youtube_${info.id}` : "youtube_audio";
    startDownloadUi({
      fileName: title ? `${title} (MP3)` : baseName,
      kind: "audio",
    });

    if (!url.trim() || !baseUrl || isSaving || !info) return;
    if (!info.audioUrl) {
      setUi({
        saveText: "Audio tidak tersedia untuk video ini.",
        downloadPercent: 100,
        downloadPillText: "Failed",
        downloadSubText: "Audio tidak tersedia",
      });
      return;
    }
    try {
      const trimmed = url.trim();
      const downloadUrl = `${baseUrl}/api/${PLATFORM}/download-mp3?url=${encodeURIComponent(trimmed)}`;
      await downloadSingleMutation.mutateAsync({ downloadUrl, ext: "mp3" });
    } catch (e) {
      const msg = getErrorMessage(e, "Gagal download audio");
      setUi({
        downloadPercent: 100,
        downloadPillText: "Failed",
        downloadSubText: msg,
      });
      throw e;
    }
  }, [
    metadata,
    videoInfo,
    startDownloadUi,
    url,
    baseUrl,
    isSaving,
    downloadSingleMutation,
    setUi,
  ]);

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
    isFetching,
    metadata,
    videoInfo,
    effectivePreviewVideoUrl,
    errorText,
    history: history.data ?? [],
    isPreviewOpen,
    previewUrl,
    previewLoadPercent,
    previewLoadText,
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
    isDownloadSuccessOpen,
    onClearHistory,
    closePreview,
    closeDownloadModal,
    closeDownloadSuccessModal,
    onPaste,
    onFetchResult,
    onPreview,
    onDownloadVideoMp4,
    onDownloadAudioMp3,
    onTogglePauseOrSave,
  };
}
