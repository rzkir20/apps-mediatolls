import * as FileSystem from "expo-file-system/legacy";

import * as MediaLibrary from "expo-media-library";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getPlatformAlbumName, formatBytes } from "@/components/ui/helper";

export function useSystemAlbumDetail(platformKey: SystemAlbumKey) {
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [albumAssetCount, setAlbumAssetCount] = useState<number | null>(null);

  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const sizeCacheRef = useRef<Record<string, string>>({});
  const [sizeVersion, setSizeVersion] = useState(0);

  const filteredAssets = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => (a?.filename ?? "").toLowerCase().includes(q));
  }, [assets, searchText]);

  const resetState = useCallback(() => {
    setSearchText("");
    setAssets([]);
    setAlbumAssetCount(null);
    setHasNextPage(false);
    setEndCursor(null);
    sizeCacheRef.current = {};
    setSizeVersion((v) => v + 1);
  }, []);

  const loadAssets = useCallback(
    async (opts: { reset?: boolean } = {}) => {
      if (assetsLoading) return;

      const isReset = !!opts.reset;
      if (isReset) resetState();

      setAssetsLoading(true);
      try {
        const perm = await MediaLibrary.getPermissionsAsync();
        if (!perm.granted) {
          const res = await MediaLibrary.requestPermissionsAsync(
            true,
            ["video", "photo", "audio"] as any,
          );
          if (!res.granted) {
            setAssets([]);
            setAlbumAssetCount(null);
            setHasNextPage(false);
            setEndCursor(null);
            return;
          }
        }

        const expectedAlbumName = getPlatformAlbumName(platformKey as any);

        // Try direct album lookup first, then fallback to fuzzy match.
        const directAlbum = await MediaLibrary.getAlbumAsync(
          expectedAlbumName,
        ).catch(() => null);

        let album = directAlbum;
        if (!album) {
          const albums = await MediaLibrary.getAlbumsAsync();
          const normalizedTarget = expectedAlbumName.toLowerCase();
          const key = String(platformKey).toLowerCase();

          album =
            albums.find((a) => {
              const title = (a.title ?? "").toLowerCase();
              const byExact = title === normalizedTarget;
              const byPlatformOnly =
                title === key || title === key.toUpperCase();
              const bySuffix = title.endsWith(`/${key}`);
              const byLoose =
                title.includes("media tools") &&
                (title.includes(key) ||
                  title.endsWith(`(${key})`) ||
                  title.includes(`(${key})`));
              return byExact || byPlatformOnly || bySuffix || byLoose;
            }) ?? null;
        }

        if (!album) {
          setAssets([]);
          setAlbumAssetCount(null);
          setHasNextPage(false);
          setEndCursor(null);
          return;
        }

        setAlbumAssetCount(album?.assetCount ?? null);

        const page = await MediaLibrary.getAssetsAsync({
          album,
          first: 24,
          after: isReset ? undefined : (endCursor ?? undefined),
        });

        const nextAssets = (page?.assets ?? []) as MediaLibrary.Asset[];
        setAssets((prev) => (isReset ? nextAssets : [...prev, ...nextAssets]));
        setHasNextPage(!!page?.hasNextPage);
        setEndCursor(page?.endCursor ?? null);
      } catch {
        setAssets([]);
        setAlbumAssetCount(null);
        setHasNextPage(false);
        setEndCursor(null);
      } finally {
        setAssetsLoading(false);
        setLoading(false);
      }
    },
    [assetsLoading, endCursor, platformKey, resetState],
  );

  useEffect(() => {
    void loadAssets({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformKey]);

  useEffect(() => {
    if (loading) return;
    if (!filteredAssets.length) return;

    let cancelled = false;
    const run = async () => {
      const limit = Math.min(20, filteredAssets.length);
      const newSizes: Record<string, string> = {};

      for (let i = 0; i < limit; i++) {
        if (cancelled) return;
        const a = filteredAssets[i];
        const id = String(a?.id ?? "");
        if (!id) continue;
        if (sizeCacheRef.current[id] || newSizes[id]) continue;

        try {
          const info = await MediaLibrary.getAssetInfoAsync(a, {
            shouldDownloadFromNetwork: false,
          } as any);

          const localUri = (info as any)?.localUri as string | undefined;
          if (!localUri) continue;

          const fi = await FileSystem.getInfoAsync(localUri, {
            md5: false,
          } as any);
          const size = (fi as any)?.size;

          if (typeof size === "number" && size > 0) {
            newSizes[id] = formatBytes(size);
          }
        } catch {
          // ignore individual size failures
        }
      }

      if (cancelled) return;
      if (Object.keys(newSizes).length) {
        sizeCacheRef.current = { ...sizeCacheRef.current, ...newSizes };
        setSizeVersion((v) => v + 1);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [filteredAssets, loading]);

  const loadNextPage = useCallback(() => {
    if (!hasNextPage) return;
    void loadAssets({ reset: false });
  }, [hasNextPage, loadAssets]);

  return {
    searchText,
    setSearchText,
    loading,
    assetsLoading,
    filteredAssets,
    albumAssetCount,
    hasNextPage,
    endCursor,
    loadNextPage,
    sizeTextById: sizeCacheRef.current,
    // `sizeVersion` is intentionally not returned; it only triggers rerenders.
    sizeVersion,
  };
}
