import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { EditAnswerUseCase } from './edit-answer';
import { makeAnswer } from 'test/factories/make-answer';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  answerAttachmentsRespository: InMemoryAnswerAttachmentsRepository;
  sut: EditAnswerUseCase;
};

const makeSut = (): SutTypes => {
  const answerAttachmentsRespository =
    new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRespository,
  );
  const sut = new EditAnswerUseCase(
    answersRepository,
    answerAttachmentsRespository,
  );
  return {
    answersRepository,
    answerAttachmentsRespository,
    sut,
  };
};

describe('Edit Answer', () => {
  it('should be able to edit a answer', async () => {
    const { sut, answersRepository, answerAttachmentsRespository } = makeSut();
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
        content: 'content',
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    answerAttachmentsRespository.items.push(
      makeAnswerAttachment({
        attachmentId: new UniqueEntityId('1'),
        answerId: newAnswer.id,
      }),
    );
    answerAttachmentsRespository.items.push(
      makeAnswerAttachment({
        attachmentId: new UniqueEntityId('2'),
        answerId: newAnswer.id,
      }),
    );
    const result = await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: 'author-1',
      content: 'new content',
      attachmentsIds: ['1', '3'],
    });
    expect(result.isRight()).toBe(true);
    expect(answersRepository.items[0]).toMatchObject({
      content: 'new content',
    });
    expect(answersRepository.items[0].attachments.currentItems).toHaveLength(2);
    expect(answersRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityId('3') }),
    ]);
  });

  it('should throws if answer not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
      content: 'content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to edit a answer from another user', async () => {
    const { sut, answersRepository } = makeSut();
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
        content: 'old content',
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    const result = await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: 'author-2',
      content: 'new content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
