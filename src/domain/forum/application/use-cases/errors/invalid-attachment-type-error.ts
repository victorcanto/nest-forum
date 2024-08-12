export class InvalidAttachmentTypeError extends Error {
  constructor(type: string) {
    super(`Invalid attachment type: ${type}`);
  }
}
