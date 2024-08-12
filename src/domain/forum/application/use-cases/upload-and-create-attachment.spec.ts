import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory/in-memory-attachments-repository';
import { FakeUploader } from 'test/storage/fake-uploader';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error';

type SutTypes = {
  attachmentsRepository: InMemoryAttachmentsRepository;
  uploader: FakeUploader;
  sut: UploadAndCreateAttachmentUseCase;
};

const makeSut = (): SutTypes => {
  const attachmentsRepository = new InMemoryAttachmentsRepository();
  const uploader = new FakeUploader();
  const sut = new UploadAndCreateAttachmentUseCase(
    attachmentsRepository,
    uploader,
  );
  return {
    attachmentsRepository,
    uploader,
    sut,
  };
};

describe('Upload and create attachment', () => {
  it('should be able to upload and create attachment with success', async () => {
    const { sut, attachmentsRepository, uploader } = makeSut();
    const result = await sut.execute({
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      body: Buffer.from('test'),
    });

    if (result.isRight()) {
      const { attachment } = result.value;
      expect(attachment.title).toBe('test.pdf');
      expect(attachmentsRepository.items[0]).toEqual(attachment);
      expect(uploader.items[0]).toEqual(
        expect.objectContaining({ fileName: 'test.pdf' }),
      );
    }
  });

  it('should not be able to upload and create attachment with invalid file type', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      fileName: 'test.mp3',
      fileType: 'audio/mp3',
      body: Buffer.from('test'),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError);
  });
});
