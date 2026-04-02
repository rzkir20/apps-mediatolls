import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import { useCallback, useEffect, useMemo, useState } from "react";

import { socialPalette } from "@/lib/pallate";

import { getPlatformAlbumName } from "@/components/ui/helper";

const DEVICES_DEBUG = __DEV__;

export type SortKey = "latest" | "oldest" | "size";

type Category = {
  key: string;
  title: string;
  icon: IconSymbolName;
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

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

  useEffect(() => {
    let cancelled = false;

    const platformDefs: {
      key:
        | "tiktok"
        | "instagram"
        | "facebook"
        | "youtube"
        | "threads"
        | "documents";
      title: string;
      icon: IconSymbolName;
      iconColor: string;
      iconBg: string;
    }[] = [
      {
        key: "tiktok",
        title: "TikTok",
        icon: "brand.tiktok",
        iconColor: "#ffffff",
        iconBg: "rgba(255,255,255,0.10)",
      },
      {
        key: "instagram",
        title: "Instagram",
        icon: "brand.instagram",
        iconColor: socialPalette.accent,
        iconBg: "rgba(255,61,87,0.10)",
      },
      {
        key: "facebook",
        title: "Facebook",
        icon: "brand.facebook",
        iconColor: "#1877F2",
        iconBg: "rgba(24,119,242,0.10)",
      },
      {
        key: "youtube",
        title: "YouTube",
        icon: "brand.youtube",
        iconColor: "#ef4444",
        iconBg: "rgba(239,68,68,0.10)",
      },
      {
        key: "threads",
        title: "Threads",
        icon: "layers",
        iconColor: "#ffffff",
        iconBg: "rgba(255,255,255,0.10)",
      },
      {
        key: "documents",
        title: "Documents",
        icon: "doc.text",
        iconColor: "#06b6d4",
        iconBg: "rgba(6,182,212,0.10)",
      },
    ];

    const load = async () => {
      try {
        setCategoriesLoading(true);
        const currentPerm = await MediaLibrary.getPermissionsAsync();
        if (cancelled) return;

        const perm = currentPerm.granted
          ? currentPerm
          : await MediaLibrary.requestPermissionsAsync();

        if (cancelled) return;

        if (!perm.granted) {
          if (DEVICES_DEBUG) {
            console.log("[System][categories] MediaLibrary permission denied", {
              canAskAgain: perm.canAskAgain,
              status: perm.status,
            });
          }
          setCategories([]);
          return;
        }

        const albums = await MediaLibrary.getAlbumsAsync();
        if (cancelled) return;
        if (DEVICES_DEBUG) {
          console.log(
            "[System][categories] Albums detected",
            albums.map((a) => ({
              id: a.id,
              title: a.title,
              assetCount: a.assetCount,
            })),
          );
        }

        const albumResults = await Promise.all(
          platformDefs.map(async (p) => {
            const albumName = getPlatformAlbumName(p.key);
            const directAlbum = await MediaLibrary.getAlbumAsync(albumName);
            if (directAlbum) {
              return { p, album: directAlbum };
            }

            const normalizedTarget = albumName.toLowerCase();
            const fallbackAlbum = albums.find((a) => {
              const title = a.title.toLowerCase();
              const byExact = title === normalizedTarget;
              const byPlatformOnly = title === p.key;
              const bySuffix = title.endsWith(`/${p.key}`);
              const byLoose =
                title.includes("media tools") && title.includes(p.key);
              return byExact || byPlatformOnly || bySuffix || byLoose;
            });

            return { p, album: fallbackAlbum ?? null };
          }),
        );

        if (cancelled) return;
        if (DEVICES_DEBUG) {
          console.log(
            "[System][categories] Match results",
            albumResults.map((r) => ({
              key: r.p.key,
              expectedAlbumName: getPlatformAlbumName(r.p.key),
              matchedTitle: r.album?.title ?? null,
              assetCount: r.album?.assetCount ?? 0,
            })),
          );
        }

        const next: Category[] = albumResults
          .filter((r) => r.album != null)
          .map((r) => {
            const assetCount = r.album?.assetCount ?? 0;
            return {
              key: r.p.key,
              title: r.p.title,
              icon: r.p.icon,
              iconBg: r.p.iconBg,
              iconColor: r.p.iconColor,
              meta: `${assetCount} Files`,
            };
          })
          .sort((a, b) => a.title.localeCompare(b.title));

        setCategories(next);
      } catch {
        if (DEVICES_DEBUG) {
          console.log("[System][categories] Failed loading categories");
        }
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
    categoriesLoading,
  };
}
