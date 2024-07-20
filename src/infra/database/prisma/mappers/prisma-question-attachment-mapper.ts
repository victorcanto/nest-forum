import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment';
import { Comment as PrismaComment, Prisma } from '@prisma/client';

export class PrismaQuestionAttachmentMapper {
  static toDomain(raw: PrismaComment): QuestionAttachment {
    if (!raw.questionId) {
      throw new Error('Invalid comment type');
    }

    return QuestionAttachment.create(
      {
        attachmentId: new UniqueEntityId(raw.id),
        questionId: new UniqueEntityId(raw.questionId),
      },
      new UniqueEntityId(raw.id),
    );
  }
}
