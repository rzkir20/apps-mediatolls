import { useCallback, useMemo, useRef } from "react";

import * as Clipboard from "expo-clipboard";

import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/lib/config";

import { getErrorMessage } from "@/components/logs";

const uiKey = ["tiktok", "ui"] as const;

function getDefaultUiState(): TiktokUiState {
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
  };
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

export function useTiktokController() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadRef = useRef<ReturnType<typeof FileSystem.createDownloadResumable> | null>(
    null,
  );
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

  const setUi = useCallback(
    (patch: Partial<TiktokUiState>) => {
      qc.setQueryData<TiktokUiState>(uiKey, (prev) => ({
        ...(prev ?? getDefaultUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const setUrl = useCallback((next: string) => setUi({ url: next }), [setUi]);

  const canFetch = useMemo(() => !!url.trim() && !!baseUrl, [url, baseUrl]);

  const metadataQuery = useQuery({
    queryKey: ["tiktok", "metadata", baseUrl, url.trim()] as const,
    queryFn: async () => {
      const trimmed = url.trim();
      const res = await fetch(
        `${baseUrl}/api/tiktok/metadata?url=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as TiktokMetadataResponse | ErrorShape;

      if (!res.ok) {
        const msg =
          (data as ErrorShape).message ??
          (data as ErrorShape).error ??
          "Gagal mengambil data video";
        throw new Error(msg);
      }

      return data as TiktokMetadataResponse;
    },
    enabled: false,
    retry: false,
  });

  const errorText = metadataQuery.error
    ? getErrorMessage(metadataQuery.error, "Terjadi kesalahan")
    : null;

  const metadata = metadataQuery.data ?? null;
  const isFetching = metadataQuery.isFetching;

  const onPaste = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text) setUi({ url: text.trim() });
  }, [setUi]);

  const onFetchResult = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || isFetching || !baseUrl) return;
    setUi({ saveText: null });
    await metadataQuery.refetch();
  }, [url, isFetching, baseUrl, metadataQuery, setUi]);

  const onPreview = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!baseUrl) {
      setUi({
        saveText:
          "API URL belum diset. Isi EXPO_PUBLIC_API_URL (mis: http://192.168.x.x:3000) lalu reload aplikasi.",
      });
      return;
    }
    const u = `${baseUrl}/api/tiktok/preview-video?url=${encodeURIComponent(trimmed)}`;
    setUi({ previewUrl: u, isPreviewOpen: true, saveText: null });
  }, [url, baseUrl, setUi]);

  const closePreview = useCallback(() => {
    setUi({ isPreviewOpen: false });
  }, [setUi]);

  const closeDownloadModal = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
    downloadRef.current?.cancelAsync().catch(() => {});
    downloadRef.current = null;
    progressRef.current = null;
    setUi({ isDownloadOpen: false });
  }, [setUi]);

  const downloadMp4Mutation = useMutation({
    mutationKey: ["tiktok", "download", "mp4", baseUrl, url.trim()],
    mutationFn: async () => {
      const trimmed = url.trim();
      if (!trimmed || !baseUrl) throw new Error("URL tidak valid");

      // Request only what we need (video/photos). This avoids AUDIO permission issues (esp. in Expo Go).
      const permission = await MediaLibrary.requestPermissionsAsync(false, [
        "video",
        "photo",
      ] as any);
      if (permission.status !== "granted") {
        throw new Error(
          "Izin penyimpanan ditolak. Aktifkan permission untuk menyimpan video.",
        );
      }

      const downloadUrl = `${baseUrl}/api/tiktok/download?url=${encodeURIComponent(trimmed)}`;

      const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!cacheDir) throw new Error("Cache directory tidak tersedia");

      const fileNameSafe = `tiktok-${Date.now()}.mp4`;
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
            // simple smoothing
            prev.speedBps = prev.speedBps ? prev.speedBps * 0.7 + inst * 0.3 : inst;
            prev.lastTs = now;
            prev.lastBytes = written;
          }

          const pct =
            expected > 0 ? Math.round((written / expected) * 100) : 0;
          const spd = progressRef.current?.speedBps ?? 0;
          const remainingSec = spd > 0 && expected > 0 ? (expected - written) / spd : NaN;

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

      setUi({ downloadPillText: "Saving" });
      const asset = await MediaLibrary.createAssetAsync(file.uri);
      await MediaLibrary.createAlbumAsync("Media Tools", asset, false).catch(
        () => {},
      );
      return asset;
    },
    onMutate: async () => {
      setUi({ saveText: null });
    },
    onSuccess: () => {
      setUi({ saveText: "Video berhasil disimpan ke Gallery." });
    },
    onError: (e) => {
      setUi({ saveText: getErrorMessage(e, "Gagal menyimpan video") });
    },
  });

  const isSaving = downloadMp4Mutation.isPending;

  const onDownloadMp4 = useCallback(async () => {
    const title = metadata?.text?.trim();
    setUi({
      downloadFileName: title || "TikTok Video",
      downloadPercent: 0,
      downloadPillText: "Preparing",
      downloadSubText: null,
      isDownloadOpen: true,
      downloadSpeedText: null,
      downloadRemainingText: null,
      downloadTotalText: null,
    });

    if (!url.trim() || !baseUrl || isSaving) return;
    try {
      await downloadMp4Mutation.mutateAsync();
      setUi({
        downloadPercent: 100,
        downloadPillText: "Completed",
        downloadSubText: "Saved to Gallery",
        downloadRemainingText: "00:00",
      });
      closeTimeoutRef.current = setTimeout(() => {
        setUi({ isDownloadOpen: false });
      }, 900);
    } catch (e) {
      const msg = getErrorMessage(e, "Gagal menyimpan video");
      setUi({
        downloadPercent: 100,
        downloadPillText: "Failed",
        downloadSubText: msg,
      });
      throw e;
    }
  }, [metadata, setUi, url, baseUrl, isSaving, downloadMp4Mutation]);

  return {
    baseUrl,
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
    canFetch,
    closePreview,
    closeDownloadModal,
    onPaste,
    onFetchResult,
    onPreview,
    onDownloadMp4,
  };
}
