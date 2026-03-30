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

  allowActionWhenCompleted?: boolean; // allow CTA click at 100% (e.g. "DOWNLOAD")

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

//======================= Tiktok Types =======================//
type TiktokUiState = {
  url: string;
  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  saveText: string | null;

  previewWidth: number;
  photoPreviewIndex: number;
  coverWidth: number;
  coverPhotoIndex: number;

  isDownloadOpen: boolean;
  downloadPercent: number;
  downloadPillText: string | null;
  downloadSubText: string | null;
  downloadFileName: string;

  downloadSpeedText: string | null;
  downloadRemainingText: string | null;
  downloadTotalText: string | null;

  isDownloadPaused: boolean;
  isDownloadReadyToSave: boolean;
};

//======================= Tiktok Dialog Types =======================//
type DialogTiktokProps = {
  isOpen: boolean;
  onClose: () => void;

  metadata: TiktokMetadataResponse | null;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  isSaving: boolean;
  saveText: string | null;

  previewWidth: number;
  photoPreviewIndex: number;
  onPreviewLayout: (e: any) => void;
  onPhotoPreviewScrollEnd: (e: any) => void;

  onDownloadVideoMp4: () => void;
  onDownloadAudioMp3: () => void;
  onDownloadPhotos: () => void;
};

//======================= Instagram Dialog Types =======================//
type DialogInstagramProps = {
  isOpen: boolean;
  onClose: () => void;

  metadata: InstagramMetadataResponse | null;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  isSaving: boolean;
  saveText: string | null;

  onDownloadVideoMp4: () => void;
  onDownloadPhotos: () => void;
};

//======================= Youtube Dialog Types =======================//
type DialogYoutubeProps = {
  isOpen: boolean;
  onClose: () => void;

  previewUrl: string | null;
  audioAvailable: boolean;
  isSaving: boolean;
  saveText: string | null;

  onDownloadVideoMp4: () => void;
  onDownloadAudioMp3: () => void;
};

//======================= Facebook Dialog Types =======================//
type DialogFacebookProps = {
  isOpen: boolean;
  onClose: () => void;

  previewUrl: string | null;
  isSaving: boolean;
  saveText: string | null;

  onDownloadVideoMp4: () => void;
};

//======================= Facebook Types =======================//
type FacebookUiState = {
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

  isDownloadPaused: boolean;
  isDownloadReadyToSave: boolean;
};

//======================= Social Header Types =======================//
type SocialHeaderProps = {
  title?: string;
  onPressProfile?: () => void;
};

type ErrorShape = { message?: string; error?: string };
