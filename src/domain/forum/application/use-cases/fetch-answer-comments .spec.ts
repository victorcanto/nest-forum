import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory/in-memory-answer-comments-repository';
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

type SutTypes = {
  answerCommentsRepository: InMemoryAnswerCommentsRepository;
  sut: FetchAnswerCommentsUseCase;
};

const makeSut = (): SutTypes => {
  const answerCommentsRepository = new InMemoryAnswerCommentsRepository();
  const sut = new FetchAnswerCommentsUseCase(answerCommentsRepository);
  return {
    answerCommentsRepository,
    sut,
  };
};

describe('Fetch Answer Comments', () => {
  it('should be able to fetch question answers', async () => {
    const { sut, answerCommentsRepository } = makeSut();
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId('answer-1'),
      }),
    );
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId('answer-1'),
      }),
    );
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityId('answer-1'),
      }),
    );
    const result = await sut.execute({
      answerId: 'answer-1',
      page: 1,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.answerComments).toHaveLength(3);
  });

  it('should be able to fetch paginated question answers', async () => {
    const { sut, answerCommentsRepository } = makeSut();
    for (let i = 1; i <= 22; i++) {
      await answerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityId('answer-1'),
          createdAt: new Date(`2024-01-${i}`),
        }),
      );
    }
    const result = await sut.execute({
      answerId: 'answer-1',
      page: 2,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.answerComments).toHaveLength(2);
  });
});
