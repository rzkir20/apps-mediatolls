type ThreadApiMediaItem = {
  type: "video" | "image";
  url: string;
};

type ThreadMetadataResponse = {
  mediaItems?: ThreadApiMediaItem[] | null;
  videoUrl?: string | null;
  caption?: string | null;
};

type ThreadsMediaItemWithPreview = {
  type: "video" | "image";
  url: string;
  previewUrl: string;
};

type ThreadsVideoInfo = VideoInfo & {
  mediaItems?: ThreadsMediaItemWithPreview[];
};

type ThreadsUiState = {
  url: string;

  slideIndex: number;

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

  saveText: string | null;
};

