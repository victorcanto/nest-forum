import {
  AnswerAttachment,
  AnswerAttachmentProps,
} from '@/domain/forum/enterprise/entities/answer-attachment';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export const makeAnswerAttachment = (
  override: Partial<AnswerAttachmentProps> = {},
  id?: UniqueEntityId,
) => {
  const answerAttachment = AnswerAttachment.create(
    {
      answerId: new UniqueEntityId(),
      attachmentId: new UniqueEntityId(),
      ...override,
    },
    id,
  );
  return answerAttachment;
};
