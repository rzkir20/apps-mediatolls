type UploadFile =
  | File
  | {
      uri: string;
      name: string;
      type?: string;
      size?: number | null;
    };

type ConvertResult = { uri: string; filename: string };

type PickedFile = {
  name: string;
  uri: string;
  size: number | null;
  mimeType?: string;
};

type FilesScreenCopy = {
  convertingDoc: string;
  convertingText: string;
  converting: string;
  pauseConverting: string;
  close: string;
  chooseFileFirst: string;
  choosePdfFirst: string;
  convertNow: string;
  cannotOpenFile: string;
};
