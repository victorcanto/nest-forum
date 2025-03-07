import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';
import { FetchRecentQuestionsUseCase } from './fetch-recent-questions';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  sut: FetchRecentQuestionsUseCase;
};

const makeSut = (): SutTypes => {
  const attachmentsRepository = new InMemoryAttachmentsRepository();
  const studentsRepository = new InMemoryStudentsRepository();
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
    attachmentsRepository,
    studentsRepository,
  );
  const sut = new FetchRecentQuestionsUseCase(questionsRepository);
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
