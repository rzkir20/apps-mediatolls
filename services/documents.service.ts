import { useCallback } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/lib/config";

import { Platform } from "react-native";

import * as FileSystem from "expo-file-system/legacy";

import { fromByteArray } from "base64-js";

export const PLATFORM = "documents";

const HISTORY_STORAGE_KEY = "convert-doc-history:v1";

const HISTORY_LIMIT = 30;

export type TargetFormat = "pdf" | "docx";

const convertDocUiKey = ["documents", "convert-doc", "ui"] as const;
const convertDocHistoryKey = ["documents", "convert-doc", "history"] as const;
const pdfToExcelUiKey = ["documents", "pdf-to-excel", "ui"] as const;
const pdfToPptUiKey = ["documents", "pdf-to-ppt", "ui"] as const;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function loadHistoryFromStorage(): Promise<HistoryItemConvert[]> {
  const parsed = safeJsonParse<unknown>(
    await AsyncStorage.getItem(HISTORY_STORAGE_KEY),
  );
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((x): x is HistoryItemConvert => {
      if (!x || typeof x !== "object") return false;
      const v = x as any;
      return (
        typeof v.id === "string" &&
        typeof v.name === "string" &&
        typeof v.fromExt === "string" &&
        typeof v.toExt === "string" &&
        typeof v.size === "number" &&
        typeof v.date === "number"
      );
    })
    .slice(0, HISTORY_LIMIT);
}

async function saveHistoryToStorage(items: HistoryItemConvert[]) {
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
}

function getFilenameFromResponseOrFile(args: {
  res: Response;
  fallbackBaseName: string;
  fallbackExt: string;
  originalFileName?: string;
}) {
  const { res, fallbackBaseName, fallbackExt, originalFileName } = args;
  const contentDisposition = res.headers.get("Content-Disposition") || "";
  const m = contentDisposition.match(/filename="?([^";\n]+)"?/i);
  if (m?.[1]) return decodeURIComponent(m[1]);

  if (originalFileName) {
    const base = originalFileName.replace(/\.[^.]+$/, "");
    return `${base}.${fallbackExt}`;
  }
  return `${fallbackBaseName}.${fallbackExt}`;
}

function triggerBlobDownloadWebOnly(blob: Blob, filename: string) {
  // Expo Web: save via <a download>. On native this won't work.
  if (typeof document === "undefined") {
    throw new Error("Download file hanya didukung di Web untuk fitur ini.");
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type UploadFile =
  | File
  | {
      uri: string;
      name: string;
      type?: string;
      size?: number | null;
    };

type ConvertResult =
  | { kind: "web"; blob: Blob; filename: string }
  | { kind: "native"; uri: string; filename: string };

function getUploadFileName(file: UploadFile) {
  return "name" in file ? file.name : "file";
}

function getUploadFileSize(file: UploadFile) {
  return typeof (file as any).size === "number" ? (file as any).size : 0;
}

function appendFileToFormData(formData: FormData, file: UploadFile) {
  // Web: File is supported directly.
  // Native: must pass `{ uri, name, type }`.
  if ("uri" in file && typeof file.uri === "string") {
    formData.append(
      "file",
      {
        uri: file.uri,
        name: file.name,
        type: file.type ?? "application/octet-stream",
      } as any,
    );
    return;
  }
  formData.append("file", file as any);
}

async function ensureDownloadsDir() {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? null;
  if (!base) throw new Error("Folder penyimpanan tidak tersedia.");
  const dir = `${base}MediaTools/Documents/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

async function saveArrayBufferToFile(args: {
  filename: string;
  buffer: ArrayBuffer;
}) {
  const dir = await ensureDownloadsDir();
  const safeName = args.filename.replace(/[\\/:*?"<>|]/g, "_");
  const uri = `${dir}${Date.now()}-${safeName}`;
  const base64 = fromByteArray(new Uint8Array(args.buffer));
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

function getDefaultConvertDocUiState(): ConvertDocUiState {
  return { file: null, targetFormat: "pdf", downloadError: null };
}

function getDefaultPdfConvertUiState(): PdfConvertUiState {
  return { file: null, downloadError: null };
}

async function persistHistory(items: HistoryItemConvert[]) {
  await saveHistoryToStorage(items.slice(0, HISTORY_LIMIT));
}

export function useStateConvertDoc() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();

  const ui = useQuery({
    queryKey: convertDocUiKey,
    queryFn: async () => getDefaultConvertDocUiState(),
    initialData: getDefaultConvertDocUiState(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const history = useQuery({
    queryKey: convertDocHistoryKey,
    queryFn: loadHistoryFromStorage,
    initialData: [],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const file = ui.data.file;
  const targetFormat = ui.data.targetFormat;
  const downloadError = ui.data.downloadError;

  const convertMutation = useMutation<ConvertResult, Error, void>({
    mutationFn: async () => {
      if (!file) throw new Error("Pilih file terlebih dahulu");
      if (!baseUrl) throw new Error("API URL belum diset");

      const formData = new FormData();
      appendFileToFormData(formData, file);
      formData.append("targetFormat", targetFormat);

      const res = await fetch(`${baseUrl}/api/convert/document`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Konversi dokumen gagal";
        try {
          const data = (await res.json()) as ErrorShape;
          message = data.message ?? data.error ?? message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      if (Platform.OS === "web") {
        const filename = getFilenameFromResponseOrFile({
          res,
          fallbackBaseName: "document",
          fallbackExt: targetFormat,
          originalFileName: getUploadFileName(file),
        });
        const blob = await res.blob();
        return { kind: "web", blob, filename };
      }

      const buffer = await res.arrayBuffer();
      const filename = getFilenameFromResponseOrFile({
        res,
        fallbackBaseName: "document",
        fallbackExt: targetFormat,
        originalFileName: getUploadFileName(file),
      });
      const uri = await saveArrayBufferToFile({ filename, buffer });
      return { kind: "native", uri, filename };
    },
    onSuccess: (data) => {
      setUi({ downloadError: null });
      if (data.kind === "web") {
        triggerBlobDownloadWebOnly(data.blob, data.filename);
      }
      void addToHistory(data.filename);
    },
    onError: (error) => {
      setUi({
        downloadError: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const converting = convertMutation.isPending;

  const setUi = useCallback(
    (patch: Partial<ConvertDocUiState>) => {
      qc.setQueryData<ConvertDocUiState>(convertDocUiKey, (prev) => ({
        ...(prev ?? getDefaultConvertDocUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const addToHistory = useCallback(
    async (downloadedFilename: string) => {
      if (!file) return;
      const origName = getUploadFileName(file);

      const fromExtMatch = origName.match(/\.([^.]+)$/);
      const fromExt = fromExtMatch?.[1]?.toLowerCase() ?? "";
      const toExtMatch = downloadedFilename.match(/\.([^.]+)$/);
      const toExt = toExtMatch?.[1]?.toLowerCase() ?? targetFormat;

      const item: HistoryItemConvert = {
        id: `${Date.now()}-${origName.slice(-12).replace(/\W/g, "")}`,
        name: origName,
        fromExt,
        toExt,
        size: getUploadFileSize(file),
        date: Date.now(),
      };

      const prev =
        qc.getQueryData<HistoryItemConvert[]>(convertDocHistoryKey) ?? [];
      const list = [item, ...prev.filter((i) => i.name !== origName)].slice(
        0,
        HISTORY_LIMIT,
      );
      qc.setQueryData<HistoryItemConvert[]>(convertDocHistoryKey, list);
      await persistHistory(list);
    },
    [file, targetFormat, qc],
  );

  const clearHistory = useCallback(() => {
    qc.setQueryData<HistoryItemConvert[]>(convertDocHistoryKey, []);
    void persistHistory([]);
  }, [qc]);

  const onFileChange = useCallback(
    (f: UploadFile | null) => {
      setUi({ file: f, downloadError: null });
    },
    [setUi],
  );

  const onTargetFormatChange = useCallback(
    (f: TargetFormat) => setUi({ targetFormat: f, downloadError: null }),
    [setUi],
  );

  const onConvert = useCallback(() => {
    if (!file) {
      setUi({ downloadError: "Pilih file dokumen terlebih dahulu" });
      return;
    }
    setUi({ downloadError: null });
    convertMutation.mutate();
  }, [file, convertMutation, setUi]);

  const historyReady = true;
  const historyItems = history.data ?? [];

  return {
    file,
    targetFormat,
    setTargetFormat: onTargetFormatChange,
    hasFile: !!file,
    converting,
    downloadError,
    historyItems,
    historyReady,
    clearHistory,
    onFileChange,
    onConvert,
  };
}

export function useStatePdfToExcel() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();

  const ui = useQuery({
    queryKey: pdfToExcelUiKey,
    queryFn: async () => getDefaultPdfConvertUiState(),
    initialData: getDefaultPdfConvertUiState(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const file = ui.data.file;
  const downloadError = ui.data.downloadError;

  const convertMutation = useMutation<ConvertResult, Error, void>({
    mutationFn: async () => {
      if (!file) throw new Error("Pilih file terlebih dahulu");
      if (!baseUrl) throw new Error("API URL belum diset");

      const formData = new FormData();
      appendFileToFormData(formData, file);

      const res = await fetch(`${baseUrl}/api/convert/pdf-to-excel`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Konversi PDF ke Excel gagal";
        try {
          const data = (await res.json()) as ErrorShape;
          message = data.message ?? data.error ?? message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const filename = getFilenameFromResponseOrFile({
        res,
        fallbackBaseName: "document",
        fallbackExt: "xlsx",
        originalFileName: getUploadFileName(file),
      });
      if (Platform.OS === "web") {
        const blob = await res.blob();
        return { kind: "web", blob, filename };
      }
      const buffer = await res.arrayBuffer();
      const uri = await saveArrayBufferToFile({ filename, buffer });
      return { kind: "native", uri, filename };
    },
    onSuccess: (data) => {
      setUi({ downloadError: null });
      if (data.kind === "web") triggerBlobDownloadWebOnly(data.blob, data.filename);
    },
    onError: (error) => {
      setUi({
        downloadError: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const converting = convertMutation.isPending;

  const setUi = useCallback(
    (patch: Partial<PdfConvertUiState>) => {
      qc.setQueryData<PdfConvertUiState>(pdfToExcelUiKey, (prev) => ({
        ...(prev ?? getDefaultPdfConvertUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const onFileChange = useCallback(
    (f: UploadFile | null) => {
      setUi({ file: f, downloadError: null });
    },
    [setUi],
  );

  const onConvert = useCallback(() => {
    if (!file) {
      setUi({ downloadError: "Pilih file PDF terlebih dahulu" });
      return;
    }
    setUi({ downloadError: null });
    convertMutation.mutate();
  }, [file, convertMutation, setUi]);

  return {
    file,
    hasFile: !!file,
    converting,
    downloadError,
    onFileChange,
    onConvert,
  };
}

export function useStatePdfToPpt() {
  const { apiUrl } = useAppConfig();
  const baseUrl = apiUrl ?? "";
  const qc = useQueryClient();

  const ui = useQuery({
    queryKey: pdfToPptUiKey,
    queryFn: async () => getDefaultPdfConvertUiState(),
    initialData: getDefaultPdfConvertUiState(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const file = ui.data.file;
  const downloadError = ui.data.downloadError;

  const convertMutation = useMutation<ConvertResult, Error, void>({
    mutationFn: async () => {
      if (!file) throw new Error("Pilih file terlebih dahulu");
      if (!baseUrl) throw new Error("API URL belum diset");

      const formData = new FormData();
      appendFileToFormData(formData, file);

      const res = await fetch(`${baseUrl}/api/convert/pdf-to-ppt`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Konversi PDF ke PPT gagal";
        try {
          const data = (await res.json()) as ErrorShape;
          message = data.message ?? data.error ?? message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const filename = getFilenameFromResponseOrFile({
        res,
        fallbackBaseName: "presentation",
        fallbackExt: "pptx",
        originalFileName: getUploadFileName(file),
      });
      if (Platform.OS === "web") {
        const blob = await res.blob();
        return { kind: "web", blob, filename };
      }
      const buffer = await res.arrayBuffer();
      const uri = await saveArrayBufferToFile({ filename, buffer });
      return { kind: "native", uri, filename };
    },
    onSuccess: (data) => {
      setUi({ downloadError: null });
      if (data.kind === "web") triggerBlobDownloadWebOnly(data.blob, data.filename);
    },
    onError: (error) => {
      setUi({
        downloadError: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const converting = convertMutation.isPending;

  const setUi = useCallback(
    (patch: Partial<PdfConvertUiState>) => {
      qc.setQueryData<PdfConvertUiState>(pdfToPptUiKey, (prev) => ({
        ...(prev ?? getDefaultPdfConvertUiState()),
        ...patch,
      }));
    },
    [qc],
  );

  const onFileChange = useCallback(
    (f: UploadFile | null) => {
      setUi({ file: f, downloadError: null });
    },
    [setUi],
  );

  const onConvert = useCallback(() => {
    if (!file) {
      setUi({ downloadError: "Pilih file PDF terlebih dahulu" });
      return;
    }
    setUi({ downloadError: null });
    convertMutation.mutate();
  }, [file, convertMutation, setUi]);

  return {
    file,
    hasFile: !!file,
    converting,
    downloadError,
    onFileChange,
    onConvert,
  };
}
