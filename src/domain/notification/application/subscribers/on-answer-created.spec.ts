import { makeAnswer } from 'test/factories/make-answer';
import { OnAnswerCreated } from './on-answer-created';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory/in-memory-notifications-repository';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  questionsRepository: InMemoryQuestionsRepository;
  sut: OnAnswerCreated;
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
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  );
  const notificationsRepository = new InMemoryNotificationsRepository();
  const sendNotificationUseCase = new SendNotificationUseCase(
    notificationsRepository,
  );
  const sut = new OnAnswerCreated(questionsRepository, sendNotificationUseCase);
  return {
    answersRepository,
    questionsRepository,
    sut,
  };
};

describe('On Answer Created', () => {
  it('should be able to send a notification', async () => {
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

    await vi.waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled();
    });
  });
});
