import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'test/factories/make-student';
import { AnswerFactory } from 'test/factories/make-answer';
import { Answer } from '@prisma/client';
import { QuestionFactory } from 'test/factories/make-question';

describe('Delete answer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let answerFactory: AnswerFactory;
  let questionFactory: QuestionFactory;
  let studentFactory: StudentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    answerFactory = moduleFixture.get<AnswerFactory>(AnswerFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[DELETE] /answers/:id', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    });

    const answerId = answer.id.toString();

    const response = await request(app.getHttpServer())
      .delete(`/answers/${answerId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(204);

    const answerUpdatedOnDatabase = await prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    });

    expect(answerUpdatedOnDatabase).toBeNull();
  });
});
