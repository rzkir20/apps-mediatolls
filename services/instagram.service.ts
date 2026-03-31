import { useCallback, useEffect, useMemo, useRef } from "react";

import { LayoutChangeEvent, Linking, Share } from "react-native";

import * as Clipboard from "expo-clipboard";

import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/lib/config";

import { getErrorMessage } from "@/components/logs";

const uiKey = ["instagram", "ui"] as const;
const historyKey = ["instagram", "history"] as const;
const STORAGE_KEY_INSTAGRAM_HISTORY = "instagram:history:v1";
const HISTORY_LIMIT = 30;

function getPreviewCacheUri(cacheDir: string, requestUrl: string) {
  const key = encodeURIComponent(requestUrl).replace(/%/g, "").slice(0, 120);
  return `${cacheDir}preview-instagram-${key}.mp4`;
}

function getDefaultUiState(): InstagramUiState {
  return {
    url: "",

    isPreviewOpen: false,
    previewUrl: null,
    previewLoadPercent: 0,
    previewLoadText: null,
    saveText: null,

    coverWidth: 0,
    coverPhotoIndex: 0,

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
    await AsyncStorage.getItem(STORAGE_KEY_INSTAGRAM_HISTORY),
  );
  return Array.isArray(parsed) ? parsed : [];
}

async function persistHistory(items: HistoryItem[]) {
  await AsyncStorage.setItem(
    STORAGE_KEY_INSTAGRAM_HISTORY,
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

type DownloadKind = "video" | "photos";

function buildVideoInfo(
  data: InstagramMetadataResponse,
  baseUrl: string,
  url: string,
): VideoInfo {
  const images = (data.images ?? undefined) || undefined;
  const count = images?.length ?? (data.cover ? 1 : 0);
  const trimmedUrl = url.trim();
  const previewImageUrls = count
    ? Array.from(
        { length: count },
        (_, i) =>
          `${baseUrl}/api/instagram/preview-image?url=${encodeURIComponent(trimmedUrl)}&index=${i}`,
      )
    : undefined;

  return {
    videoUrl: data.videoUrl,
    previewVideoUrl: data.videoUrl
      ? `${baseUrl}/api/instagram/preview-video?url=${encodeURIComponent(trimmedUrl)}`
      : undefined,
    audioUrl: undefined,
    images,
    cover: data.cover,
    previewImageUrls,
    text: data.text,
    author: data.author,
  };
}

export function useInstagramController() {
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

  const coverWidth = ui.data.coverWidth;
  const coverPhotoIndex = ui.data.coverPhotoIndex;

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

  const setUi = useCallback(
    (patch: Partial<InstagramUiState>) => {
      qc.setQueryData<InstagramUiState>(uiKey, (prev) => ({
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
    async (meta: InstagramMetadataResponse, originUrl: string) => {
      const trimmedUrl = originUrl.trim();
      if (!trimmedUrl) return;

      const isImage = !!meta.images?.length;
      const cover = isImage
        ? (meta.images?.[0] ?? meta.cover ?? "")
        : (meta.cover ?? "");

      const item: HistoryItem = {
        id: String(Date.now()),
        url: trimmedUrl,
        title:
          meta.text?.trim() ||
          (isImage ? "Instagram Photos" : "Instagram Video"),
        author: meta.author ? `@${meta.author}` : undefined,
        cover,
        type: isImage ? "Image" : "Video",
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
    await AsyncStorage.removeItem(STORAGE_KEY_INSTAGRAM_HISTORY);
  }, [qc]);

  const historyItems = history.data ?? [];
  const historyLength = historyItems.length;

  const openConfirmClearHistory = useCallback(() => {
    if (!historyLength) return;
    setUi({ isConfirmClearOpen: true });
  }, [historyLength, setUi]);

  const closeConfirmClearHistory = useCallback(() => {
    setUi({ isConfirmClearOpen: false });
  }, [setUi]);

  const onConfirmClearHistory = useCallback(async () => {
    closeConfirmClearHistory();
    await onClearHistory();
  }, [closeConfirmClearHistory, onClearHistory]);

  const canFetch = useMemo(() => !!url.trim() && !!baseUrl, [url, baseUrl]);

  const metadataQuery = useQuery({
    queryKey: ["instagram", "metadata", baseUrl, url.trim()] as const,
    queryFn: async () => {
      const trimmed = url.trim();
      const res = await fetch(
        `${baseUrl}/api/instagram/metadata?url=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as InstagramMetadataResponse | ErrorShape;

      if (!res.ok) {
        const msg =
          (data as ErrorShape).message ??
          (data as ErrorShape).error ??
          "Gagal mengambil data";
        throw new Error(msg);
      }

      return data as InstagramMetadataResponse;
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

  const onCoverLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0) setUi({ coverWidth: w });
    },
    [setUi],
  );

  const onCoverPhotoScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const w = coverWidth || 0;
      if (!w) return;
      const idx = Math.round(e.nativeEvent.contentOffset.x / w);
      setUi({ coverPhotoIndex: Math.max(0, idx) });
    },
    [coverWidth, setUi],
  );

  const onOpenInstagramApp = useCallback(async () => {
    const candidates = ["instagram://", "instagram://app"];
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
    await Linking.openURL("https://www.instagram.com/");
  }, []);

  const onShareDownloaded = useCallback(async () => {
    const shareText =
      saveText?.trim() ||
      `Download selesai: ${downloadFileName || "Media dari Media Tools"}`;
    try {
      await Share.share({ message: shareText });
    } catch {
      // noop
    }
  }, [saveText, downloadFileName]);

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

    // Photo post: open preview without video url (UI can use preview images).
    if (metadata?.images?.length) {
      setUi({ previewUrl: null, isPreviewOpen: true, saveText: null });
      return;
    }

    if (!baseUrl) {
      setUi({
        saveText:
          "API URL belum diset. Isi EXPO_PUBLIC_API_URL (mis: http://192.168.x.x:3000) lalu reload aplikasi.",
      });
      return;
    }

    const u = `${baseUrl}/api/instagram/preview-video?url=${encodeURIComponent(trimmed)}`;
    const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!cacheDir) {
      setUi({ saveText: "Cache directory tidak tersedia." });
      return;
    }

    const fromRef = previewCacheRef.current[trimmed];
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
      delete previewCacheRef.current[trimmed];
    }

    const previewUri = getPreviewCacheUri(cacheDir, u);
    const info = await FileSystem.getInfoAsync(previewUri);
    if (info.exists && !info.isDirectory) {
      previewCacheRef.current[trimmed] = previewUri;
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
          qc.setQueryData<InstagramUiState>(uiKey, (prev) => {
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
      previewCacheRef.current[trimmed] = file.uri;
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
  }, [url, baseUrl, metadata, qc, setUi]);

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
    mutationKey: ["instagram", "download", "single", baseUrl, url.trim()],
    mutationFn: async (args: { downloadUrl: string; ext: "mp4" | "jpg" }) => {
      const { downloadUrl, ext } = args;
      if (!downloadUrl) throw new Error("URL download tidak tersedia");

      const cacheDir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDir) throw new Error("Cache directory tidak tersedia");

      const fileNameSafe = `instagram-${Date.now()}.${ext}`;
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

  const downloadPhotosMutation = useMutation({
    mutationKey: ["instagram", "download", "photos", baseUrl, url.trim()],
    mutationFn: async (args: { imageUrls: string[] }) => {
      const imageUrls = args.imageUrls.filter(Boolean);
      if (!imageUrls.length)
        throw new Error("Tidak ada foto untuk di-download");

      const cacheDir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDir) throw new Error("Cache directory tidak tersedia");

      downloadedFileUrisRef.current = [];
      progressRef.current = null;
      downloadRef.current = null;

      const total = imageUrls.length;
      for (let i = 0; i < total; i++) {
        const u = imageUrls[i]!;
        const fileNameSafe = `instagram-photo-${Date.now()}-${i + 1}.jpg`;
        const fileUri = `${cacheDir}${fileNameSafe}`;

        setUi({
          downloadPillText: "Downloading",
          downloadSubText: `Photo ${i + 1} / ${total}`,
          downloadPercent: Math.round((i / total) * 100),
          downloadSpeedText: null,
          downloadRemainingText: null,
          downloadTotalText: `${i} / ${total} photos`,
        });

        const file = await FileSystem.downloadAsync(u, fileUri, {
          cache: true,
        });
        if (!file?.uri) throw new Error("Download foto gagal");
        downloadedFileUrisRef.current.push(file.uri);
      }

      setUi({
        downloadPercent: 100,
        downloadPillText: "Ready",
        downloadSubText: `Tap DOWNLOAD untuk simpan (${total} foto)`,
        downloadRemainingText: "00:00",
        downloadTotalText: `${total} / ${total} photos`,
        isDownloadReadyToSave: true,
      });

      return downloadedFileUrisRef.current;
    },
    onMutate: async () => {
      downloadedFileUrisRef.current = [];
      setUi({ saveText: null });
    },
    onError: (e) => {
      setUi({ saveText: getErrorMessage(e, "Gagal download foto") });
    },
  });

  const saveToGalleryMutation = useMutation({
    mutationKey: ["instagram", "save", "gallery", baseUrl, url.trim()],
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
    const title = metadata?.text?.trim();
    startDownloadUi({ fileName: title || "Instagram Video", kind: "video" });

    if (!url.trim() || !baseUrl || isSaving) return;
    try {
      const direct = metadata?.videoUrl;
      const fallback = `${baseUrl}/api/instagram/download?url=${encodeURIComponent(url.trim())}`;
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
    metadata,
    startDownloadUi,
    url,
    baseUrl,
    isSaving,
    downloadSingleMutation,
    setUi,
  ]);

  const onDownloadPhotos = useCallback(async () => {
    const title = metadata?.text?.trim();
    startDownloadUi({
      fileName: title ? `${title} (Photos)` : "Instagram Photos",
      kind: "photos",
    });

    if (!url.trim() || !baseUrl || isSaving) return;
    try {
      const images = (metadata?.images ?? [])?.filter(Boolean) ?? [];
      if (!images.length) throw new Error("Foto tidak tersedia untuk post ini");
      await downloadPhotosMutation.mutateAsync({ imageUrls: images });
    } catch (e) {
      const msg = getErrorMessage(e, "Gagal download foto");
      setUi({
        downloadPercent: 100,
        downloadPillText: "Failed",
        downloadSubText: msg,
      });
      throw e;
    }
  }, [
    metadata,
    startDownloadUi,
    url,
    baseUrl,
    isSaving,
    downloadPhotosMutation,
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
    history: historyItems,
    coverWidth,
    coverPhotoIndex,
    isConfirmClearOpen,
    openConfirmClearHistory,
    closeConfirmClearHistory,
    onConfirmClearHistory,
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
    closePreview,
    closeDownloadModal,
    closeDownloadSuccessModal,
    onPaste,
    onCoverLayout,
    onCoverPhotoScrollEnd,
    onFetchResult,
    onPreview,
    onDownloadVideoMp4,
    onDownloadPhotos,
    onTogglePauseOrSave,
    onOpenInstagramApp,
    onShareDownloaded,
  };
}
