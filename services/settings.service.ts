import { useCallback, useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as MediaLibrary from "expo-media-library";

import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";

import { Camera } from "expo-camera";

async function safeMessage(e: unknown) {
  return e instanceof Error ? e.message : "Terjadi kesalahan";
}

const permissionsQueryKey = ["settings", "permissions"] as const;

async function fetchPermissions(): Promise<PermissionSnapshot> {
  const [ml, cam, mic] = await Promise.all([
    MediaLibrary.getPermissionsAsync(),
    Camera.getCameraPermissionsAsync(),
    getRecordingPermissionsAsync(),
  ]);
  return {
    mediaLibrary: ml.status === "granted",
    camera: cam.status === "granted",
    microphone: mic.status === "granted",
  };
}

export function useSettingsPermissionsController() {
  const qc = useQueryClient();

  const permissions = useQuery({
    queryKey: permissionsQueryKey,
    queryFn: fetchPermissions,
    staleTime: 5_000,
    gcTime: 5 * 60_000,
  });

  const requestMediaLibrary = useMutation({
    mutationKey: ["settings", "permissions", "request", "mediaLibrary"],
    mutationFn: async (_origin: "storage" | "files") => {
      const res = await MediaLibrary.requestPermissionsAsync();
      return res.status === "granted";
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: permissionsQueryKey });
    },
  });

  const requestCamera = useMutation({
    mutationKey: ["settings", "permissions", "request", "camera"],
    mutationFn: async () => {
      const res = await Camera.requestCameraPermissionsAsync();
      return res.status === "granted";
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: permissionsQueryKey });
    },
  });

  const requestMicrophone = useMutation({
    mutationKey: ["settings", "permissions", "request", "microphone"],
    mutationFn: async () => {
      const res = await requestRecordingPermissionsAsync();
      return res.status === "granted";
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: permissionsQueryKey });
    },
  });

  const grantAll = useMutation({
    mutationKey: ["settings", "permissions", "request", "all"],
    mutationFn: async () => {
      await MediaLibrary.requestPermissionsAsync();
      await Camera.requestCameraPermissionsAsync();
      await requestRecordingPermissionsAsync();
      await qc.invalidateQueries({ queryKey: permissionsQueryKey });
      return true;
    },
  });

  const mediaLibrary = permissions.data?.mediaLibrary ?? false;
  const camera = permissions.data?.camera ?? false;
  const microphone = permissions.data?.microphone ?? false;

  const filesAccess = mediaLibrary;

  const allGranted = useMemo(
    () => mediaLibrary && camera && microphone && filesAccess,
    [mediaLibrary, camera, microphone, filesAccess],
  );

  const busy: CardKey | null = useMemo(() => {
    if (grantAll.isPending) return "storage";
    if (requestMediaLibrary.isPending)
      return requestMediaLibrary.variables ?? "storage";
    if (requestCamera.isPending) return "camera";
    if (requestMicrophone.isPending) return "mic";
    return null;
  }, [
    grantAll.isPending,
    requestMediaLibrary.isPending,
    requestMediaLibrary.variables,
    requestCamera.isPending,
    requestMicrophone.isPending,
  ]);

  const localError = useMemo(() => {
    const err =
      permissions.error ??
      requestMediaLibrary.error ??
      requestCamera.error ??
      requestMicrophone.error ??
      grantAll.error;
    return err
      ? err instanceof Error
        ? err.message
        : "Terjadi kesalahan"
      : null;
  }, [
    permissions.error,
    requestMediaLibrary.error,
    requestCamera.error,
    requestMicrophone.error,
    grantAll.error,
  ]);

  const safeRequest = useCallback(
    async (key: CardKey) => {
      try {
        if (key === "storage" || key === "files") {
          await requestMediaLibrary.mutateAsync(key);
          return;
        }
        if (key === "camera") {
          await requestCamera.mutateAsync();
          return;
        }
        await requestMicrophone.mutateAsync();
      } catch {
        // error already surfaced via mutation.error
      }
    },
    [requestCamera, requestMediaLibrary, requestMicrophone],
  );

  const onGrantAll = useCallback(async () => {
    if (allGranted || busy) return;
    try {
      await grantAll.mutateAsync();
    } catch {
      // error already surfaced via mutation.error
    }
  }, [allGranted, busy, grantAll]);

  const refresh = useCallback(async () => {
    try {
      await qc.invalidateQueries({ queryKey: permissionsQueryKey });
      await qc.refetchQueries({ queryKey: permissionsQueryKey });
    } catch (e) {
      throw new Error(await safeMessage(e));
    }
  }, [qc]);

  return {
    mediaLibrary,
    camera,
    microphone,
    isRefreshing: permissions.isFetching,
    lastError: localError,
    refresh,
    busy,
    localError,
    filesAccess,
    allGranted,
    safeRequest,
    onGrantAll,
  };
}
