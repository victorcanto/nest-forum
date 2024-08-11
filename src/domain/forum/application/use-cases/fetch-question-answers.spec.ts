import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { makeQuestion } from 'test/factories/make-question';
import { FetchQuestionAnswersUseCase } from './fetch-question-answers';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  sut: FetchQuestionAnswersUseCase;
};

const makeSut = (): SutTypes => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  );
  const sut = new FetchQuestionAnswersUseCase(answersRepository);
  return {
    answersRepository,
    sut,
  };
};

describe('Fetch Question Answers', () => {
  it('should be able to fetch question answers', async () => {
    const { sut, answersRepository } = makeSut();
    const newQuestion = makeQuestion();
    await answersRepository.create(makeAnswer({ questionId: newQuestion.id }));
    await answersRepository.create(makeAnswer({ questionId: newQuestion.id }));
    await answersRepository.create(makeAnswer({ questionId: newQuestion.id }));

    const result = await sut.execute({
      questionId: newQuestion.id.toString(),
      page: 1,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.answers).toHaveLength(3);
  });

  it('should be able to fetch paginated question answers', async () => {
    const { sut, answersRepository } = makeSut();
    const newQuestion = makeQuestion();
    for (let i = 1; i <= 22; i++) {
      await answersRepository.create(
        makeAnswer({
          questionId: newQuestion.id,
          createdAt: new Date(`2024-01-${i}`),
        }),
      );
    }
    const result = await sut.execute({
      questionId: newQuestion.id.toString(),
      page: 2,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.answers).toHaveLength(2);
  });
});
