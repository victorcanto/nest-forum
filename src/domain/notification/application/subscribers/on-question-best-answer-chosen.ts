import { DomainEvents } from '@/core/events/domain-events';
import { EventHandler } from '@/core/events/event-handler';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { QuestionBestAnswerChosenEvent } from '@/domain/forum/enterprise/events/question-best-answer-chosen-event';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';

export class OnQuesiontBestAnswerChosen implements EventHandler {
  constructor(
    private readonly answersRespository: AnswersRepository,
    private readonly sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestAnswerChosenEvent.name,
    );
  }

  private async sendQuestionBestAnswerNotification({
    question,
    bestAnswerId,
  }: QuestionBestAnswerChosenEvent): Promise<void> {
    const answer = await this.answersRespository.findById(
      bestAnswerId.toString(),
    );

    if (answer) {
      await this.sendNotification.execute({
        recipientId: answer.authorId.toString(),
        title: 'Your answer on question',
        content: `Your answer on question "${question.title
          .substring(0, 20)
          .concat('...')}" is the best answer!`,
      });
    }
  }
}
