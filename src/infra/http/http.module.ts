import { makeFactoryProvider } from '@/infra/utils/make-factory-provider.util';
import { Module } from '@nestjs/common';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CreateAccountController } from './controllers/create-account.controller';
import { CreateQuestionController } from './controllers/create-question.controller';
import { FetchRecentQuestionsController } from './controllers/fetch-recent-questions.controller';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { DatabaseModule } from '../database/database.module';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository';
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
import { EditQuestionController } from './controllers/edit-question.controller';
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question';
import { DeleteQuestionController } from './controllers/delete-question.controller';
import { AnswerQuestionController } from './controllers/answer-question.controller';
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { EditAnswerController } from './controllers/edit-answer.controller';
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';
import { DeleteAnswerController } from './controllers/delete-answer.controller';
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer';
import { FetchQuestionAnswersController } from './controllers/fetch-question-answers.controller';
import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    AuthenticateController,
    CreateAccountController,
    CreateQuestionController,
    EditQuestionController,
    DeleteQuestionController,
    FetchRecentQuestionsController,
    GetQuestionBySlugController,
    AnswerQuestionController,
    EditAnswerController,
    DeleteAnswerController,
    FetchQuestionAnswersController,
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
    makeFactoryProvider(EditQuestionUseCase, [
      QuestionsRepository,
      QuestionAttachmentsRepository,
    ]),
    makeFactoryProvider(DeleteQuestionUseCase, [QuestionsRepository]),
    makeFactoryProvider(FetchRecentQuestionsUseCase, [QuestionsRepository]),
    makeFactoryProvider(GetQuestionBySlugUseCase, [QuestionsRepository]),
    makeFactoryProvider(AnswerQuestionUseCase, [AnswersRepository]),
    makeFactoryProvider(EditAnswerUseCase, [
      AnswersRepository,
      AnswerAttachmentsRepository,
    ]),
    makeFactoryProvider(DeleteAnswerUseCase, [AnswersRepository]),
    makeFactoryProvider(FetchQuestionAnswersUseCase, [AnswersRepository]),
  ],
})
export class HttpModule {}
