import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import * as MediaLibrary from "expo-media-library";

import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";

import { Camera } from "expo-camera";

export type PermissionKey = "mediaLibrary" | "camera" | "microphone";

export type PermissionState = {
  mediaLibrary: boolean;
  camera: boolean;
  microphone: boolean;
  isRefreshing: boolean;
  lastError: string | null;
};

type PermissionContextValue = PermissionState & {
  refresh: () => Promise<void>;
  request: (key: PermissionKey) => Promise<boolean>;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

async function safeMessage(e: unknown) {
  return e instanceof Error ? e.message : "Terjadi kesalahan";
}

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mediaLibrary, setMediaLibrary] = useState(false);
  const [camera, setCamera] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setLastError(null);
    try {
      const [ml, cam, mic] = await Promise.all([
        MediaLibrary.getPermissionsAsync(),
        Camera.getCameraPermissionsAsync(),
        getRecordingPermissionsAsync(),
      ]);
      setMediaLibrary(ml.status === "granted");
      setCamera(cam.status === "granted");
      setMicrophone(mic.status === "granted");
    } catch (e) {
      setLastError(await safeMessage(e));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const request = useCallback(async (key: PermissionKey) => {
    setLastError(null);
    try {
      if (key === "mediaLibrary") {
        const res = await MediaLibrary.requestPermissionsAsync();
        const ok = res.status === "granted";
        setMediaLibrary(ok);
        return ok;
      }
      if (key === "camera") {
        const res = await Camera.requestCameraPermissionsAsync();
        const ok = res.status === "granted";
        setCamera(ok);
        return ok;
      }
      const res = await requestRecordingPermissionsAsync();
      const ok = res.status === "granted";
      setMicrophone(ok);
      return ok;
    } catch (e) {
      setLastError(await safeMessage(e));
      return false;
    }
  }, []);

  const value = useMemo<PermissionContextValue>(
    () => ({
      mediaLibrary,
      camera,
      microphone,
      isRefreshing,
      lastError,
      refresh,
      request,
    }),
    [
      mediaLibrary,
      camera,
      microphone,
      isRefreshing,
      lastError,
      refresh,
      request,
    ],
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx)
    throw new Error("usePermissions must be used within PermissionProvider");
  return ctx;
}
