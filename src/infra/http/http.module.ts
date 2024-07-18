import { makeFactoryProvider } from '@/infra/utils/make-factory-provider.util';
import { Module } from '@nestjs/common';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateQuestionController } from './controllers/create-question.controller';
import { FetchRecentQuestionsController } from './controllers/fetch-recent-questions.controller';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { DatabaseModule } from '../database/database.module';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';

@Module({
  imports: [DatabaseModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateQuestionController,
    FetchRecentQuestionsController,
  ],
  providers: [
    makeFactoryProvider(CreateQuestionUseCase, [QuestionsRepository]),
    makeFactoryProvider(FetchRecentQuestionsUseCase, [QuestionsRepository]),
  ],
})
export class HttpModule {}
