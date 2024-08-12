import {
  Uploader,
  UploadParams,
  UploadResult,
} from '@/domain/forum/application/storage/uploader';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { EnvService } from '../env/env.service';
import { randomUUID } from 'node:crypto';

export class R2Storage implements Uploader {
  private client: S3Client;
  constructor(private readonly env: EnvService) {
    const accountId = this.env.get('CLOUDFLARE_ACCOUNT_ID');

    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: this.env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.env.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }
  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<UploadResult> {
    const uploadId = randomUUID();

    const uniqueFileName = `${uploadId}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.env.get('AWS_BUCKET_NAME'),
      Key: uniqueFileName,
      Body: body,
      ContentType: fileType,
    });

    await this.client.send(command);

    return {
      url: uniqueFileName,
    };
  }
}
