import * as FileSystem from "expo-file-system/legacy";

import { useCallback, useEffect, useMemo, useState } from "react";

import { socialPalette } from "@/lib/pallate";

export type SortKey = "latest" | "oldest" | "size";

type Category = {
  key: "videos" | "images" | "audio" | "stories";
  title: string;
  icon: "video" | "photo" | "music.note" | "drama";
  iconBg: string;
  iconColor: string;
  meta: string;
};

function formatBytes(bytes: number) {
  const KB = 1000;
  const MB = KB * 1000;
  const GB = MB * 1000;

  const isInt = (n: number) => Math.abs(n - Math.round(n)) < 0.01;
  const fmt = (value: number, unit: string) => {
    const decimals = isInt(value) ? 0 : 1;
    return `${value.toFixed(decimals)} ${unit}`;
  };

  if (bytes < KB) return `${bytes.toFixed(0)} B`;
  if (bytes < MB) return fmt(bytes / KB, "KB");
  if (bytes < GB) return fmt(bytes / MB, "MB");
  return fmt(bytes / GB, "GB");
}

export function useDevicesController() {
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const [searchText, setSearchText] = useState("");

  const [storageLoading, setStorageLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [storageErrorText, setStorageErrorText] = useState<string | null>(null);
  const [storageRetryNonce, setStorageRetryNonce] = useState(0);
  const [storageTotalBytes, setStorageTotalBytes] = useState<number | null>(
    null,
  );
  const [storageFreeBytes, setStorageFreeBytes] = useState<number | null>(null);

  const retryStorage = useCallback(() => {
    setStorageRetryNonce((n) => n + 1);
  }, []);

  const storageUsedBytes = useMemo(() => {
    if (storageTotalBytes == null || storageFreeBytes == null) return null;
    return Math.max(0, storageTotalBytes - storageFreeBytes);
  }, [storageTotalBytes, storageFreeBytes]);

  const storagePercentUsed = useMemo(() => {
    if (storageUsedBytes == null || storageTotalBytes == null) return null;
    if (storageTotalBytes <= 0) return 0;
    return (storageUsedBytes / storageTotalBytes) * 100;
  }, [storageTotalBytes, storageUsedBytes]);

  useEffect(() => {
    let cancelled = false;

    const loadStorage = async () => {
      try {
        setStorageLoading(true);
        setStorageError(false);
        setStorageErrorText(null);
        const [free, total] = await Promise.all([
          FileSystem.getFreeDiskStorageAsync(),
          FileSystem.getTotalDiskCapacityAsync(),
        ]);

        if (cancelled) return;
        setStorageFreeBytes(free);
        setStorageTotalBytes(total);
      } catch (e) {
        if (cancelled) return;
        setStorageError(true);
        const msg = e instanceof Error ? e.message : String(e);
        setStorageErrorText(msg);
        setStorageFreeBytes(null);
        setStorageTotalBytes(null);
      } finally {
        if (!cancelled) setStorageLoading(false);
      }
    };

    void loadStorage();

    return () => {
      cancelled = true;
    };
  }, [storageRetryNonce]);

  const categories = useMemo<Category[]>(
    () => [
      {
        key: "videos",
        title: "Videos",
        icon: "video",
        iconBg: "rgba(59, 130, 246, 0.10)",
        iconColor: "#3b82f6",
        meta: "42 Files • 124 MB",
      },
      {
        key: "images",
        title: "Images",
        icon: "photo",
        iconBg: "rgba(225, 29, 72, 0.10)",
        iconColor: socialPalette.accent,
        meta: "128 Files • 18 MB",
      },
      {
        key: "audio",
        title: "Audio",
        icon: "music.note",
        iconBg: "rgba(249, 115, 22, 0.10)",
        iconColor: "#f97316",
        meta: "12 Files • 9.4 MB",
      },
      {
        key: "stories",
        title: "Stories",
        icon: "drama",
        iconBg: "rgba(6, 182, 212, 0.10)",
        iconColor: "#06b6d4",
        meta: "8 Files • 5.4 MB",
      },
    ],
    [],
  );

  const storageUsedText =
    storageUsedBytes == null ? "Tidak tersedia" : formatBytes(storageUsedBytes);
  const storageTotalText =
    storageTotalBytes == null
      ? "Tidak tersedia"
      : formatBytes(storageTotalBytes);
  const storagePercentRounded = Math.round(storagePercentUsed ?? 0);

  return {
    sortKey,
    setSortKey,
    searchText,
    setSearchText,

    storageLoading,
    storageError,
    storageErrorText,
    retryStorage,
    storageUsedText,
    storageTotalText,
    storagePercentRounded,

    categories,
  };
}

