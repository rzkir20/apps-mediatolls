import { useCallback, useEffect, useMemo, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/lib/config";

import { socialPalette } from "@/lib/pallate";

import * as FileSystem from "expo-file-system/legacy";

import { Alert, Linking, Platform } from "react-native";

import * as DocumentPicker from "expo-document-picker";

import * as Haptics from "expo-haptics";

import { fromByteArray } from "base64-js";

export const PLATFORM = "documents";

const HISTORY_STORAGE_KEY = "convert-doc-history:v1";

const HISTORY_LIMIT = 30;
const CONVERT_TIMEOUT_MS = 120_000;

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

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = CONVERT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Proses konversi timeout. Coba lagi dengan file lebih kecil.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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

function getUploadFileName(file: UploadFile) {
  return "name" in file ? file.name : "file";
}

function getUploadFileSize(file: UploadFile) {
  return typeof (file as any).size === "number" ? (file as any).size : 0;
}

function appendFileToFormData(formData: FormData, file: UploadFile) {
  if (!("uri" in file) || typeof file.uri !== "string") {
    throw new Error("Mode web tidak didukung. Gunakan aplikasi mobile.");
  }
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type ?? "application/octet-stream",
  } as any);
}

async function ensureDownloadsDir() {
  const base =
    FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? null;
  if (!base) throw new Error("Folder penyimpanan tidak tersedia.");
  const albumName =
    Platform.OS === "android"
      ? "Media Tools/documents"
      : "Media Tools (documents)";
  const dir = `${base}${albumName}/`;
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

  const convertMutation = useMutation<
    ConvertResult,
    Error,
    TargetFormat | undefined
  >({
    mutationFn: async (requestedTargetFormat) => {
      const activeTargetFormat = requestedTargetFormat ?? targetFormat;
      if (!file) throw new Error("Pilih file terlebih dahulu");
      if (!baseUrl) throw new Error("API URL belum diset");

      const formData = new FormData();
      appendFileToFormData(formData, file);
      formData.append("targetFormat", activeTargetFormat);

      const res = await fetchWithTimeout(`${baseUrl}/api/convert/document`, {
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

      const buffer = await res.arrayBuffer();
      const filename = getFilenameFromResponseOrFile({
        res,
        fallbackBaseName: "document",
        fallbackExt: activeTargetFormat,
        originalFileName: getUploadFileName(file),
      });
      const uri = await saveArrayBufferToFile({ filename, buffer });
      return { kind: "native", uri, filename } as const;
    },
    onSuccess: (data) => {
      setUi({ downloadError: null });
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

  const onConvert = useCallback(
    (nextTargetFormat?: TargetFormat) => {
      if (!file) {
        setUi({ downloadError: "Pilih file dokumen terlebih dahulu" });
        return;
      }
      const activeTargetFormat = nextTargetFormat ?? targetFormat;
      setUi({ targetFormat: activeTargetFormat, downloadError: null });
      convertMutation.mutate(activeTargetFormat);
    },
    [file, convertMutation, setUi, targetFormat],
  );

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
    lastConvertedUri:
      convertMutation.data?.kind === "native" ? convertMutation.data.uri : null,
    lastConvertedFilename: convertMutation.data?.filename ?? null,
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

      const res = await fetchWithTimeout(
        `${baseUrl}/api/convert/pdf-to-excel`,
        {
          method: "POST",
          body: formData,
        },
      );

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
      const buffer = await res.arrayBuffer();
      const uri = await saveArrayBufferToFile({ filename, buffer });
      return { kind: "native", uri, filename } as const;
    },
    onSuccess: (data) => {
      setUi({ downloadError: null });
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
    lastConvertedUri:
      convertMutation.data?.kind === "native" ? convertMutation.data.uri : null,
    lastConvertedFilename: convertMutation.data?.filename ?? null,
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

      const res = await fetchWithTimeout(`${baseUrl}/api/convert/pdf-to-ppt`, {
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
      const buffer = await res.arrayBuffer();
      const uri = await saveArrayBufferToFile({ filename, buffer });
      return { kind: "native", uri, filename } as const;
    },
    onSuccess: (data) => {
      setUi({ downloadError: null });
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
    lastConvertedUri:
      convertMutation.data?.kind === "native" ? convertMutation.data.uri : null,
    lastConvertedFilename: convertMutation.data?.filename ?? null,
  };
}

export function useFilesScreenState(copy: FilesScreenCopy) {
  const [formatIndex, setFormatIndex] = useState(0);
  const [quality, setQuality] = useState<1 | 2 | 3>(3);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([
    {
      id: "1",
      name: "Business_Proposal.pdf",
      meta: "Converted to DOCX • 2.4 MB",
      icon: "picture-as-pdf" as const,
      iconBg: socialPalette.docPdfBg,
      iconColor: socialPalette.docPdf,
    },
    {
      id: "2",
      name: "Monthly_Report_Final.docx",
      meta: "Converted to PDF • 840 KB",
      icon: "description" as const,
      iconBg: socialPalette.docWordBg,
      iconColor: socialPalette.docWord,
    },
  ]);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDownloadSuccessModal, setShowDownloadSuccessModal] =
    useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [hasActiveConvert, setHasActiveConvert] = useState(false);

  const {
    file,
    targetFormat,
    setTargetFormat,
    onFileChange,
    onConvert,
    converting,
    downloadError,
    lastConvertedUri,
    lastConvertedFilename,
  } = useStateConvertDoc();

  const excel = useStatePdfToExcel();
  const ppt = useStatePdfToPpt();
  const convertingAny = converting || excel.converting || ppt.converting;

  useEffect(() => {
    if (convertingAny) {
      setShowConvertModal(true);
      setConvertProgress((prev) => (prev > 0 ? prev : 8));
    }
  }, [convertingAny]);

  useEffect(() => {
    if (!convertingAny || !hasActiveConvert) return;
    const id = setInterval(() => {
      setConvertProgress((prev) => {
        if (prev >= 92) return prev;
        const step = prev < 30 ? 6 : prev < 70 ? 4 : 2;
        return Math.min(92, prev + step);
      });
    }, 500);
    return () => clearInterval(id);
  }, [convertingAny, hasActiveConvert]);

  useEffect(() => {
    const errorMessage =
      downloadError || excel.downloadError || ppt.downloadError;
    if (!errorMessage) return;
    setConvertProgress(100);
    setHasActiveConvert(false);
    Alert.alert("Konversi gagal", errorMessage);
  }, [downloadError, excel.downloadError, ppt.downloadError]);

  useEffect(() => {
    if (!hasActiveConvert || convertingAny) return;
    const errorMessage =
      downloadError || excel.downloadError || ppt.downloadError;
    if (errorMessage) return;
    setConvertProgress(100);
    setHasActiveConvert(false);
    setShowConvertModal(false);
  }, [
    convertingAny,
    hasActiveConvert,
    downloadError,
    excel.downloadError,
    ppt.downloadError,
  ]);

  const selectedOutputKey = useMemo(() => {
    if (formatIndex === 0) return "pdf";
    if (formatIndex === 1) return "docx";
    if (formatIndex === 2) return "xlsx";
    return "pptx";
  }, [formatIndex]);

  const qualityLabel = useMemo(() => {
    if (quality === 3) return "High";
    if (quality === 2) return "Medium";
    return "Low";
  }, [quality]);

  const haptic = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const onClearRecent = useCallback(() => {
    haptic();
    setRecentItems([]);
  }, [haptic]);

  const pickDocument = useCallback(async () => {
    haptic();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type:
          selectedOutputKey === "xlsx" || selectedOutputKey === "pptx"
            ? "application/pdf"
            : "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({
        name: asset.name,
        uri: asset.uri,
        size: asset.size ?? null,
        mimeType: asset.mimeType,
      });
      const upload = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "application/octet-stream",
        size: asset.size ?? null,
      };
      onFileChange(upload);
      excel.onFileChange(selectedOutputKey === "xlsx" ? upload : null);
      ppt.onFileChange(selectedOutputKey === "pptx" ? upload : null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(copy.cannotOpenFile, msg);
    }
  }, [
    copy.cannotOpenFile,
    excel,
    haptic,
    onFileChange,
    ppt,
    selectedOutputKey,
  ]);

  const onConvertNow = useCallback(() => {
    setHasActiveConvert(true);
    setConvertProgress(8);
    setShowConvertModal(true);

    if (selectedOutputKey === "pdf" || selectedOutputKey === "docx") {
      onConvert(selectedOutputKey);
      return;
    }

    if (selectedOutputKey === "xlsx") {
      excel.onConvert();
      return;
    }

    ppt.onConvert();
  }, [excel, onConvert, ppt, selectedOutputKey]);

  const latestResultUriForSelection =
    selectedOutputKey === "xlsx"
      ? excel.lastConvertedUri
      : selectedOutputKey === "pptx"
        ? ppt.lastConvertedUri
        : lastConvertedUri;

  const latestResultFilenameForSelection =
    selectedOutputKey === "xlsx"
      ? excel.lastConvertedFilename
      : selectedOutputKey === "pptx"
        ? ppt.lastConvertedFilename
        : lastConvertedFilename;

  const canDownloadResult = !convertingAny && !!latestResultUriForSelection;

  const ctaDisabled =
    convertingAny ||
    (!canDownloadResult &&
      (selectedOutputKey === "pdf" || selectedOutputKey === "docx"
        ? !file
        : selectedOutputKey === "xlsx"
          ? !excel.file
          : !ppt.file));

  const onPrimaryCtaPress = useCallback(() => {
    haptic();
    if (canDownloadResult && latestResultUriForSelection) {
      void Linking.openURL(latestResultUriForSelection)
        .then(() => {
          setShowDownloadSuccessModal(true);
        })
        .catch((error) => {
          const msg = error instanceof Error ? error.message : String(error);
          Alert.alert(
            "Gagal membuka file",
            latestResultFilenameForSelection
              ? `Tidak bisa membuka ${latestResultFilenameForSelection}.\n${msg}`
              : msg,
          );
        });
      return;
    }
    onConvertNow();
  }, [
    canDownloadResult,
    haptic,
    latestResultFilenameForSelection,
    latestResultUriForSelection,
    onConvertNow,
  ]);

  const convertCtaLabel = convertingAny
    ? copy.converting
    : canDownloadResult
      ? "DOWNLOAD"
      : selectedOutputKey === "pdf" || selectedOutputKey === "docx"
        ? file
          ? `${copy.convertNow} (${targetFormat.toUpperCase()})`
          : copy.chooseFileFirst
        : selectedOutputKey === "xlsx"
          ? excel.file
            ? `${copy.convertNow} (XLSX)`
            : copy.choosePdfFirst
          : ppt.file
            ? `${copy.convertNow} (PPTX)`
            : copy.choosePdfFirst;

  return {
    file,
    targetFormat,
    setTargetFormat,
    formatIndex,
    setFormatIndex,
    quality,
    setQuality,
    formatModalOpen,
    setFormatModalOpen,
    recentItems,
    pickedFile,
    showConvertModal,
    setShowConvertModal,
    showDownloadSuccessModal,
    setShowDownloadSuccessModal,
    convertProgress,
    setConvertProgress,
    hasActiveConvert,
    setHasActiveConvert,
    convertingAny,
    selectedOutputKey,
    qualityLabel,
    canDownloadResult,
    latestResultUriForSelection,
    latestResultFilenameForSelection,
    ctaDisabled,
    convertCtaLabel,
    onClearRecent,
    pickDocument,
    onPrimaryCtaPress,
    haptic,
  };
}
