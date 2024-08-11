import { makeQuestionComment } from 'test/factories/make-question-comment';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory/in-memory-question-comments-repository';
import { FetchQuestionCommentsUseCase } from './fetch-question-comments';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

type SutTypes = {
  questionCommentsRepository: InMemoryQuestionCommentsRepository;
  sut: FetchQuestionCommentsUseCase;
};

const makeSut = (): SutTypes => {
  const questionCommentsRepository = new InMemoryQuestionCommentsRepository();
  const sut = new FetchQuestionCommentsUseCase(questionCommentsRepository);
  return {
    questionCommentsRepository,
    sut,
  };
};

describe('Fetch Question Answers', () => {
  it('should be able to fetch question questions', async () => {
    const { sut, questionCommentsRepository } = makeSut();
    await questionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId('question-1'),
      }),
    );
    await questionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId('question-1'),
      }),
    );
    await questionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityId('question-1'),
      }),
    );
    const result = await sut.execute({
      questionId: 'question-1',
      page: 1,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.questionComments).toHaveLength(3);
  });

  it('should be able to fetch paginated question questions', async () => {
    const { sut, questionCommentsRepository } = makeSut();
    for (let i = 1; i <= 22; i++) {
      await questionCommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityId('question-1'),
          createdAt: new Date(`2024-01-${i}`),
        }),
      );
    }
    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.questionComments).toHaveLength(2);
  });
});
