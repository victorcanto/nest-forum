import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { DeleteAnswerUseCase } from './delete-answer';
import { makeAnswer } from 'test/factories/make-answer';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
  sut: DeleteAnswerUseCase;
};

const makeSut = (): SutTypes => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  );
  const sut = new DeleteAnswerUseCase(answersRepository);
  return {
    answersRepository,
    answerAttachmentsRepository,
    sut,
  };
};

describe('Delete Answer', () => {
  it('should be able to delete a answer', async () => {
    const { sut, answersRepository, answerAttachmentsRepository } = makeSut();
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    answerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityId('1'),
      }),
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityId('2'),
      }),
    );
    await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    });
    expect(answersRepository.items).toHaveLength(0);
    expect(answerAttachmentsRepository.items).toHaveLength(0);
  });

  it('should throws if answer not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a answer from another user', async () => {
    const { sut, answersRepository } = makeSut();
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-2',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
