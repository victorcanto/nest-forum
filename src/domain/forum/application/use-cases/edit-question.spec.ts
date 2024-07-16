import { InMemoryQuestionsRepository } from '@/test/repositories/in-memory/in-memory-questions-repository';
import { EditQuestionUseCase } from './edit-question';
import { makeQuestion } from '@/test/factories/make-question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryQuestionAttachmentsRepository } from '@/test/repositories/in-memory/in-memory-question-attachments-repository';
import { makeQuestionAttachment } from '@/test/factories/make-question-attachment';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
  sut: EditQuestionUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const sut = new EditQuestionUseCase(
    questionsRepository,
    questionAttachmentsRepository,
  );
  return {
    questionsRepository,
    questionAttachmentsRepository,
    sut,
  };
};

describe('Edit Question', () => {
  it('should be able to edit a question', async () => {
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
        attachmentId: new UniqueEntityId('1'),
        questionId: newQuestion.id,
      }),
    );
    questionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        attachmentId: new UniqueEntityId('2'),
        questionId: newQuestion.id,
      }),
    );
    const result = await sut.execute({
      questionId: newQuestion.id.toString(),
      authorId: 'author-1',
      title: 'new title',
      content: 'new content',
      attachmentsIds: ['1', '3'],
    });
    expect(questionsRepository.items[0]).toMatchObject({
      title: 'new title',
      content: 'new content',
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        title: 'new title',
        content: 'new content',
      }),
    });
    expect(questionsRepository.items[0].attachments.currentItems).toHaveLength(
      2,
    );
    expect(questionsRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityId('3') }),
    ]);
  });

  it('should throws if question not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      questionId: 'question-1',
      authorId: 'author-1',
      title: 'new title',
      content: 'new content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to edit a question from another user', async () => {
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
      questionId: newQuestion.id.toString(),
      authorId: 'author-2',
      title: 'new title',
      content: 'new content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
