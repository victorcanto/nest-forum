import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from 'test/factories/make-student';
import { QuestionFactory } from 'test/factories/make-question';
import { DatabaseModule } from '@/infra/database/database.module';
import { AnswerFactory } from 'test/factories/make-answer';

describe('Fetch question answers (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    answerFactory = moduleFixture.get<AnswerFactory>(AnswerFactory);
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[GET] /questions/:questionId/answers', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    await Promise.all([
      answerFactory.makePrismaAnswer({
        authorId: user.id,
        questionId: question.id,
        content: 'My first answer',
      }),
      answerFactory.makePrismaAnswer({
        authorId: user.id,
        questionId: question.id,
        content: 'My last answer',
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({ content: 'My first answer' }),
        expect.objectContaining({ content: 'My last answer' }),
      ]),
    });
  });
});
