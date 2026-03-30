import { useCallback, useEffect, useMemo, useRef } from "react";

import * as Clipboard from "expo-clipboard";

import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig, withApiSecret } from "@/lib/config";

import { getErrorMessage } from "@/components/logs";

const uiKey = ["facebook", "ui"] as const;
const historyKey = ["facebook", "history"] as const;
const STORAGE_KEY_FACEBOOK_HISTORY = "facebook:history:v1";
const HISTORY_LIMIT = 30;
const PLATFORM = "facebook";

function getPreviewCacheUri(cacheDir: string, requestUrl: string) {
  const key = encodeURIComponent(requestUrl).replace(/%/g, "").slice(0, 120);
  return `${cacheDir}preview-facebook-${key}.mp4`;
}

function getDefaultUiState(): FacebookUiState {
  return {
    url: "",

    isPreviewOpen: false,
    previewUrl: null,
    saveText: null,

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
    await AsyncStorage.getItem(STORAGE_KEY_FACEBOOK_HISTORY),
  );
  return Array.isArray(parsed) ? parsed : [];
}

async function persistHistory(items: HistoryItem[]) {
  await AsyncStorage.setItem(
    STORAGE_KEY_FACEBOOK_HISTORY,
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

function buildVideoInfo(
  data: FacebookMetadataResponse,
  baseUrl: string,
  url: string,
): VideoInfo {
  const trimmedUrl = url.trim();
  const previewVideoUrl = data.videoUrl
    ? withApiSecret(
        `${baseUrl}/api/${PLATFORM}/preview-video?url=${encodeURIComponent(trimmedUrl)}`,
      )
    : undefined;

  return {
    videoUrl: data.videoUrl ?? undefined,
    videoUrlHd: undefined,
    qualities: undefined,
    formatOptions: undefined,
    previewVideoUrl,
    audioUrl: undefined,
    images: undefined,
    cover: data.thumbnail ?? undefined,
    previewImageUrls: undefined,
    text: data.title ?? undefined,
    author: undefined,
    duration: data.duration ?? undefined,
    durationMs: data.durationMs ?? undefined,
    id: data.id ?? undefined,
  };
}

export function useFacebookController() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadRef = useRef<ReturnType<
    typeof FileSystem.createDownloadResumable
  > | null>(null);
  const downloadedFileUrisRef = useRef<string[]>([]);
  const historyHydratedRef = useRef(false);
  const previewDownloadRef = useRef<ReturnType<typeof FileSystem.createDownloadResumable> | null>(
    null,
  );
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
  const saveText = ui.data.saveText;

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

  const setUi = useCallback(
    (patch: Partial<FacebookUiState>) => {
      qc.setQueryData<FacebookUiState>(uiKey, (prev) => ({
        ...(prev ?? getDefaultUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const setUrl = useCallback((next: string) => setUi({ url: next }), [setUi]);

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
    async (meta: FacebookMetadataResponse, originUrl: string) => {
      const trimmedUrl = originUrl.trim();
      if (!trimmedUrl) return;

      const item: HistoryItem = {
        id: String(Date.now()),
        url: trimmedUrl,
        title: meta.title?.trim()?.slice(0, 80) || "Facebook Video",
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
    qc.setQueryData<HistoryItem[]>(historyKey, []);
    await AsyncStorage.removeItem(STORAGE_KEY_FACEBOOK_HISTORY);
  }, [qc]);

  const canFetch = useMemo(() => !!url.trim() && !!baseUrl, [url, baseUrl]);

  const metadataQuery = useQuery({
    queryKey: ["facebook", "metadata", baseUrl, url.trim()] as const,
    queryFn: async () => {
      const trimmed = url.trim();
      const res = await fetch(
        `${baseUrl}/api/${PLATFORM}/metadata?url=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as FacebookMetadataResponse | ErrorShape;

      if (!res.ok) {
        const msg =
          (data as ErrorShape).message ??
          (data as ErrorShape).error ??
          "Gagal mengambil data";
        throw new Error(msg);
      }

      return data as FacebookMetadataResponse;
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

  const onPaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUi({ url: text.trim() });
  }, [setUi]);

  const onFetchResult = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || isFetching || !baseUrl) return;
    setUi({ saveText: null });
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

    const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!cacheDir) {
      setUi({ saveText: "Cache directory tidak tersedia." });
      return;
    }
    const cacheKey = trimmed;
    const fromRef = previewCacheRef.current[cacheKey];
    if (fromRef) {
      const fileInfo = await FileSystem.getInfoAsync(fromRef);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        setUi({ previewUrl: fromRef, isPreviewOpen: true, saveText: null });
        return;
      }
      delete previewCacheRef.current[cacheKey];
    }

    const previewUri = getPreviewCacheUri(cacheDir, info.previewVideoUrl);
    const cachedInfo = await FileSystem.getInfoAsync(previewUri);
    if (cachedInfo.exists && !cachedInfo.isDirectory) {
      previewCacheRef.current[cacheKey] = previewUri;
      setUi({ previewUrl: previewUri, isPreviewOpen: true, saveText: null });
      return;
    }

    previewRequestIdRef.current += 1;
    const requestId = previewRequestIdRef.current;
    previewDownloadRef.current?.cancelAsync().catch(() => {});
    previewDownloadRef.current = null;
    setUi({ previewUrl: null, isPreviewOpen: true, saveText: null });
    try {
      const task = FileSystem.createDownloadResumable(info.previewVideoUrl, previewUri, {
        cache: true,
      });
      previewDownloadRef.current = task;
      const file = await task.downloadAsync();
      if (previewRequestIdRef.current !== requestId) return;
      if (!file?.uri) throw new Error("Gagal menyiapkan preview video");
      previewCacheRef.current[cacheKey] = file.uri;
      setUi({ previewUrl: file.uri, isPreviewOpen: true, saveText: null });
    } catch (e) {
      if (previewRequestIdRef.current !== requestId) return;
      setUi({
        isPreviewOpen: false,
        previewUrl: null,
        saveText: getErrorMessage(e, "Gagal memuat preview video"),
      });
    } finally {
      if (previewRequestIdRef.current === requestId) previewDownloadRef.current = null;
    }
  }, [url, baseUrl, videoInfo, setUi]);

  const closePreview = useCallback(() => {
    previewRequestIdRef.current += 1;
    previewDownloadRef.current?.cancelAsync().catch(() => {});
    previewDownloadRef.current = null;
    setUi({ isPreviewOpen: false });
  }, [setUi]);

  const closeDownloadModal = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
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

  const downloadSingleMutation = useMutation({
    mutationKey: ["facebook", "download", "single", baseUrl, url.trim()],
    mutationFn: async (args: { downloadUrl: string; ext: "mp4" }) => {
      const { downloadUrl, ext } = args;
      if (!downloadUrl) throw new Error("URL download tidak tersedia");

      const cacheDir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDir) throw new Error("Cache directory tidak tersedia");

      const fileNameSafe = `facebook-${Date.now()}.${ext}`;
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

          setUi({
            downloadPercent: Math.max(0, Math.min(100, pct)),
            downloadPillText: "Downloading",
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
    mutationKey: ["facebook", "save", "gallery", baseUrl, url.trim()],
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
      });
    },
    [setUi],
  );

  const onDownloadVideoMp4 = useCallback(async () => {
    const info = videoInfo;
    const title = metadata?.title?.trim();
    startDownloadUi({ fileName: title || "Facebook Video" });

    if (!url.trim() || !baseUrl || isSaving || !info) return;
    try {
      const trimmed = url.trim();
      const direct = info.videoUrl;
      const fallback = `${baseUrl}/api/${PLATFORM}/download?url=${encodeURIComponent(trimmed)}`;
      await downloadSingleMutation.mutateAsync({
        downloadUrl: direct || fallback,
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
    videoInfo,
    metadata,
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
    errorText,
    history: history.data ?? [],
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
    isDownloadPaused,
    isDownloadReadyToSave,
    onClearHistory,
    closePreview,
    closeDownloadModal,
    onPaste,
    onFetchResult,
    onPreview,
    onDownloadVideoMp4,
    onTogglePauseOrSave,
  };
}
