import { InMemoryQuestionsRepository } from '@/test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from '@/test/repositories/in-memory/in-memory-question-attachments-repository';
import { DeleteQuestionUseCase } from './delete-question';
import { makeQuestion } from '@/test/factories/make-question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { makeQuestionAttachment } from '@/test/factories/make-question-attachment';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
  sut: DeleteQuestionUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const sut = new DeleteQuestionUseCase(questionsRepository);
  return {
    questionsRepository,
    questionAttachmentsRepository,
    sut,
  };
};

describe('Delete Question', () => {
  it('should be able to delete a question', async () => {
    const { sut, questionsRepository, questionAttachmentsRepository } =
      makeSut();
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
        slug: Slug.create('example-question'),
      },
      new UniqueEntityId('question-1'),
    );
    await questionsRepository.create(newQuestion);
    questionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId('1'),
      }),
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityId('2'),
      }),
    );
    await sut.execute({
      questionId: 'question-1',
      authorId: 'author-1',
    });
    expect(questionsRepository.items).toHaveLength(0);
    expect(questionAttachmentsRepository.items).toHaveLength(0);
  });

  it('should throws if question not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      questionId: 'question-1',
      authorId: 'author-1',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a question from another user', async () => {
    const { sut, questionsRepository } = makeSut();
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
        slug: Slug.create('example-question'),
      },
      new UniqueEntityId('question-1'),
    );
    await questionsRepository.create(newQuestion);
    const result = await sut.execute({
      questionId: 'question-1',
      authorId: 'author-2',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
