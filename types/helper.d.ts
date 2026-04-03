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

type HistoryItemBase = {
  id: string;
  type: HistoryItem["type"];
  url: string;
  title: string;
  author?: string | null;
  cover?: string | null;
};

type HistoryCardProps = {
  item: HistoryItemBase;
  onPress: () => void;
  onDelete?: () => void;
  showChevron?: boolean;
  chevronIconName?: "chevron.right" | "arrow.right";
  thumbnailVariant?: "lg" | "sm";
  containerClassName?: string;
};

//============================ Bottom Sheets ============================//
interface BottomSheetsProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

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

type DownloadSuccessModalProps = {
  visible: boolean;

  title?: string;
  message?: string;
  fileName: string;
  /** When set, shows a 16:9 preview strip with title/size overlay (e.g. platform thumbnail). */
  previewImageUri?: string;
  /** Leading icon next to the title on the preview overlay (defaults to `movie`). */
  previewOverlayIconName?: string;
  sizeText?: string;
  qualityText?: string;
  speedText?: string;
  durationText?: string;
  formatText?: string;

  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  backLabel?: string;

  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onBack?: () => void;
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
  isDownloadSuccessOpen: boolean;
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
  onDownloadPhotos: (activePhotoIndex?: number) => void | Promise<void>;
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
  onDownloadPhotos: (activePhotoIndex?: number) => void | Promise<void>;
};

//======================= Instagram Types =======================//
type InstagramUiState = {
  url: string;

  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  saveText: string | null;

  coverWidth: number;
  coverPhotoIndex: number;

  isConfirmClearOpen: boolean;

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
  isDownloadSuccessOpen: boolean;
};

//======================= Youtube Dialog Types =======================//
type DialogYoutubeProps = {
  isOpen: boolean;
  onClose: () => void;

  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  audioAvailable: boolean;
  isSaving: boolean;
  saveText: string | null;

  onDownloadVideoMp4: () => void;
  onDownloadAudioMp3: () => void;
};

//======================= Youtube Types =======================//
type YoutubeUiState = {
  url: string;

  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  saveText: string | null;

  isQualitySheetOpen: boolean;
  isConfirmClearOpen: boolean;

  selectedFormatIndex: number;

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
  isDownloadSuccessOpen: boolean;
};

//======================= Facebook Dialog Types =======================//
type DialogFacebookProps = {
  isOpen: boolean;
  onClose: () => void;

  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  isSaving: boolean;
  saveText: string | null;

  onDownloadVideoMp4: () => void;
};

//======================= Facebook Types =======================//
type FacebookUiState = {
  url: string;

  isPreviewOpen: boolean;
  previewUrl: string | null;
  previewLoadPercent: number;
  previewLoadText: string | null;
  saveText: string | null;

  isConfirmClearOpen: boolean;

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
  isDownloadSuccessOpen: boolean;
};

type DownloadKind = "video" | "audio" | "photos";

//======================= Document Converter Types =======================//
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

type ErrorShape = { message?: string; error?: string };

type ConvertDocUiState = {
  file: UploadFile | null;
  targetFormat: TargetFormat;
  downloadError: string | null;
};

type PdfConvertUiState = {
  file: UploadFile | null;
  downloadError: string | null;
};

//======================= Social Header Types =======================//
type SocialHeaderProps = {
  title?: string;
  onPressSystem?: () => void;
};

//======================= Supported Format Cards Types =======================//
type SupportedFormatCard = {
  title: string;
  sub: string;
  icon: string;
  fullWidth?: boolean;
};

type SupportedFormatCardsProps = {
  cards: SupportedFormatCard[];
  onPressCard?: (card: SupportedFormatCard) => void;
  containerClassName?: string;
  cardClassName?: string;
  iconBgClassName?: string;
};

//======================= Delete Confirm Modal Types =======================//
type IconSymbolName =
  keyof typeof import("../components/ui/icon-symbol").ICON_SYMBOL_MAPPING;

type DeleteConfirmModalProps = {
  visible: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  iconName?: IconSymbolName;
  iconColor?: string;
  children?: ReactNode;
};

//======================= System Album Detail Types =======================//
type Props = {
  platformKey:
    | "tiktok"
    | "instagram"
    | "facebook"
    | "youtube"
    | "threads"
    | "documents"
    | string;
  title?: string;
};

type SystemAlbumKey =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "youtube"
  | "threads"
  | "documents"
  | string;
