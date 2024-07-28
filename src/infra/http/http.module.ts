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
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository';
import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer';
import { Encrypter } from '@/domain/forum/application/cryptography/encrypter';
import { RegisterStudentUseCase } from '@/domain/forum/application/use-cases/register-student';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { GetQuestionBySlugController } from './controllers/get-question-by-slug.controller';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateQuestionController,
    FetchRecentQuestionsController,
    GetQuestionBySlugController,
  ],
  providers: [
    makeFactoryProvider(AuthenticateStudentUseCase, [
      StudentsRepository,
      HashComparer,
      Encrypter,
    ]),
    makeFactoryProvider(RegisterStudentUseCase, [
      StudentsRepository,
      HashGenerator,
    ]),
    makeFactoryProvider(CreateQuestionUseCase, [QuestionsRepository]),
    makeFactoryProvider(FetchRecentQuestionsUseCase, [QuestionsRepository]),
    makeFactoryProvider(GetQuestionBySlugUseCase, [QuestionsRepository]),
  ],
})
export class HttpModule {}
