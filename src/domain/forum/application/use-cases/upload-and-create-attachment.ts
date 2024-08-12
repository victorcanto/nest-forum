import { Either, left, right } from '@/core/either';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error';
import { Attachment } from '@/domain/forum/enterprise/entities/attachment';
import { AttachmentsRepository } from '@/domain/forum/application/repositories/attachments-repository';
import { Uploader } from '@/domain/forum/application/storage/uploader';

export class UploadAndCreateAttachmentUseCase {
  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    const re = /^(image\/(jpe?g|png)|application\/(pdf|octet-stream))$/i;
    if (!re.test(fileType)) {
      return left(new InvalidAttachmentTypeError(fileType));
    }

    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    });

    const attachment = Attachment.create({
      title: fileName,
      url,
    });

    await this.attachmentsRepository.create(attachment);

    return right({
      attachment,
    });
  }
}

type UploadAndCreateAttachmentUseCaseRequest = {
  fileName: string;
  fileType: string;
  body: Buffer;
};

type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentTypeError,
  { attachment: Attachment }
>;
