import {
  Uploader,
  UploadParams,
  UploadResult,
} from '@/domain/forum/application/storage/uploader';
import { randomUUID } from 'node:crypto';

export class FakeUploader implements Uploader {
  public items: Upload[] = [];

  async upload(params: UploadParams): Promise<UploadResult> {
    const url = randomUUID();

    this.items.push({
      fileName: params.fileName,
      url,
    });

    return {
      url,
    };
  }
}

type Upload = {
  fileName: string;
  url: string;
};
