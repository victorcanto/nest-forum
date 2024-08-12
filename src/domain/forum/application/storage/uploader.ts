export abstract class Uploader {
  abstract upload(params: UploadParams): Promise<UploadResult>;
}

export type UploadParams = {
  fileName: string;
  fileType: string;
  body: Buffer;
};

export type UploadResult = {
  url: string;
};
