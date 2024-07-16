import { InMemoryQuestionsRepository } from '@/test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from '@/test/repositories/in-memory/in-memory-question-attachments-repository';
import { FetchRecentTopicsUseCase } from './fetch-recent-topics';
import { makeQuestion } from '@/test/factories/make-question';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  sut: FetchRecentTopicsUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const sut = new FetchRecentTopicsUseCase(questionsRepository);
  return {
    questionsRepository,
    sut,
  };
};

describe('Fetch Recent Topics', () => {
  it('should be able to fetch recent topics', async () => {
    const { sut, questionsRepository } = makeSut();
    await questionsRepository.create(
      makeQuestion({
        createdAt: new Date(`2024-01-23`),
      }),
    );
    await questionsRepository.create(
      makeQuestion({
        createdAt: new Date(`2024-01-24`),
      }),
    );
    await questionsRepository.create(
      makeQuestion({
        createdAt: new Date(`2024-01-25`),
      }),
    );
    const result = await sut.execute({
      page: 1,
    });
    expect(result.value?.questions).toHaveLength(3);
    expect(result.value?.questions).toEqual([
      expect.objectContaining({
        createdAt: new Date(`2024-01-25`),
      }),
      expect.objectContaining({
        createdAt: new Date(`2024-01-24`),
      }),
      expect.objectContaining({
        createdAt: new Date(`2024-01-23`),
      }),
    ]);
  });

  it('should be able to fetch paginated recent topics', async () => {
    const { sut, questionsRepository } = makeSut();
    for (let i = 1; i <= 22; i++) {
      await questionsRepository.create(
        makeQuestion({
          createdAt: new Date(`2024-01-${i}`),
        }),
      );
    }
    const result = await sut.execute({
      page: 2,
    });
    expect(result.value?.questions).toHaveLength(2);
  });
});
