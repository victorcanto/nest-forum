import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Either, left, right } from '@/core/either';
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment';
import { QuestionAttachmentList } from '@/domain/forum/enterprise/entities/question-attachment-list';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { QuestionAlreadyExistsError } from './errors/question-already-exists-error';

export class CreateQuestionUseCase {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute({
    authorId,
    title,
    content,
    attachmentsIds,
  }: CreateQuestionUseCaseRequest): Promise<CreateQuestionUseCaseResponse> {
    const questionAlreadyExists = await this.questionsRepository.findBySlug(
      Slug.createFromText(title).value,
    );

    if (questionAlreadyExists) {
      return left(new QuestionAlreadyExistsError(title));
    }

    const question = Question.create({
      authorId: new UniqueEntityId(authorId),
      title,
      content,
    });

    const questionAttachments = attachmentsIds.map((attachmentId) => {
      return QuestionAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        questionId: question.id,
      });
    });

    question.attachments = new QuestionAttachmentList(questionAttachments);

    await this.questionsRepository.create(question);

    return right({
      question,
    });
  }
}

type CreateQuestionUseCaseRequest = {
  authorId: string;
  title: string;
  content: string;
  attachmentsIds: string[];
};

type CreateQuestionUseCaseResponse = Either<
  QuestionAlreadyExistsError,
  { question: Question }
>;
