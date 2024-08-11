import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'test/factories/make-student';
import { AnswerFactory } from 'test/factories/make-answer';
import { QuestionFactory } from 'test/factories/make-question';

describe('Choose question best answer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let answerFactory: AnswerFactory;
  let questionFactory: QuestionFactory;
  let studentFactory: StudentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, AnswerFactory, QuestionFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    answerFactory = moduleFixture.get<AnswerFactory>(AnswerFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[PATCH] /answers/:answerId/choose-as-best', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    });

    const answerId = answer.id.toString();

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answerId}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New content',
      });

    expect(response.status).toBe(204);

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        id: question.id.toString(),
      },
    });
    expect(questionOnDatabase?.bestAnswerId).toEqual(answerId);
  });
});
