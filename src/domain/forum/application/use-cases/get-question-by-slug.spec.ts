import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';
import { makeQuestion } from 'test/factories/make-question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  sut: GetQuestionBySlugUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const sut = new GetQuestionBySlugUseCase(questionsRepository);
  return {
    questionsRepository,
    sut,
  };
};

describe('Get Question By Slug', () => {
  it('should be able to get a question by slug', async () => {
    const { sut, questionsRepository } = makeSut();
    const newQuestion = makeQuestion({
      slug: Slug.create('example-question'),
    });
    await questionsRepository.create(newQuestion);
    const result = await sut.execute({
      slug: 'example-question',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        id: newQuestion.id,
        title: newQuestion.title,
      }),
    });
  });
});
