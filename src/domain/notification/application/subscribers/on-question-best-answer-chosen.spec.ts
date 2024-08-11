import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory/in-memory-notifications-repository';
import { makeQuestion } from 'test/factories/make-question';
import { OnQuesiontBestAnswerChosen } from './on-question-best-answer-chosen';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  questionsRepository: InMemoryQuestionsRepository;
  sut: OnQuesiontBestAnswerChosen;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  );
  const notificationsRepository = new InMemoryNotificationsRepository();
  const sendNotificationUseCase = new SendNotificationUseCase(
    notificationsRepository,
  );
  const sut = new OnQuesiontBestAnswerChosen(
    answersRepository,
    sendNotificationUseCase,
  );
  return {
    answersRepository,
    questionsRepository,
    sut,
  };
};

describe('On Question Best Answer Chosen', () => {
  it('should be able to send a notification when a question best answer is chosen', async () => {
    const { answersRepository, questionsRepository } = makeSut();
    const sendNotificationExecuteSpy = vi.spyOn(
      SendNotificationUseCase.prototype,
      'execute',
    );
    const question = makeQuestion();
    const answer = makeAnswer({
      questionId: question.id,
    });
    await questionsRepository.create(question);
    await answersRepository.create(answer);

    question.bestAnswerId = answer.id;
    await questionsRepository.save(question);

    await vi.waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled();
    });
  });
});
