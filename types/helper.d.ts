//======================= History Item Types =======================//
interface HistoryItemConvert {
  id: string;
  name: string;
  fromExt: string;
  toExt: string;
  size: number;
  date: number;
}

type HistoryItem = {
  id: string;
  url: string;
  title: string;
  author?: string;
  cover: string;
  type: "Video" | "Music" | "Image";
  date: number;
};

//======================= Download Progress Modal Types =======================//
type DownloadProgressMetadataItem = {
  label: string;
  value: string;
  gradient?: boolean;
};

type DownloadProgressModalProps = {
  visible: boolean;
  fileName: string;

  progressPercent: number; // 0 - 100
  statusPillText?: string; // default "Downloading"
  statusSubText?: string; // default "Completed"

  speedText?: string;
  remainingText?: string;
  downloadedTotalText?: string; // e.g. "156.8 MB / 234 MB"
  qualityText?: string;

  isPaused?: boolean;
  isSaving?: boolean;

  pauseLabel?: string; // default "PAUSE DOWNLOAD"
  cancelLabel?: string; // default "CANCEL"

  onPause?: () => void;
  onCancel?: () => void;

  onRequestClose?: () => void;
};

//======================= Permission Types =======================//
type CardKey = "storage" | "camera" | "mic" | "files";

type PermissionSnapshot = {
  mediaLibrary: boolean;
  camera: boolean;
  microphone: boolean;
};

type TiktokUiState = {
  url: string;
  isPreviewOpen: boolean;
  previewUrl: string | null;
  saveText: string | null;

  isDownloadOpen: boolean;
  downloadPercent: number;
  downloadPillText: string | null;
  downloadSubText: string | null;
  downloadFileName: string;

  downloadSpeedText: string | null;
  downloadRemainingText: string | null;
  downloadTotalText: string | null;
};

type ErrorShape = { message?: string; error?: string };