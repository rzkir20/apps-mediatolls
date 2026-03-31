type YoutubeFormatItem = {
  itag?: number;
  qualityLabel?: string | null;
  isAudioOnly?: boolean;
};

interface YoutubeMetadataResponse {
  id?: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  durationSeconds?: number;
  formats?: YoutubeFormatItem[];
}
