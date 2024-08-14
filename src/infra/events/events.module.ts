import { Module } from '@nestjs/common';
import { makeFactoryProvider } from '../utils/make-factory-provider.util';
import { OnAnswerCreated } from '@/domain/notification/application/subscribers/on-answer-created';
import { DatabaseModule } from '../database/database.module';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification';
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository';
import { OnQuesiontBestAnswerChosen } from '@/domain/notification/application/subscribers/on-question-best-answer-chosen';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    makeFactoryProvider(SendNotificationUseCase, [NotificationsRepository]),
    makeFactoryProvider(OnAnswerCreated, [
      QuestionsRepository,
      SendNotificationUseCase,
    ]),
    makeFactoryProvider(OnQuesiontBestAnswerChosen, [
      AnswersRepository,
      SendNotificationUseCase,
    ]),
  ],
})
export class EventsModule {}
