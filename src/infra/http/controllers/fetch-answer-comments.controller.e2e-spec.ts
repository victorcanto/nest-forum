import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from '@/test/factories/make-student';
import { QuestionFactory } from '@/test/factories/make-question';
import { DatabaseModule } from '@/infra/database/database.module';
import { AnswerFactory } from '@/test/factories/make-answer';
import { AnswerCommentFactory } from '@/test/factories/make-answer-comment';

describe('Fetch answer comments (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let answerCommentFactory: AnswerCommentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AnswerCommentFactory,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    answerFactory = moduleFixture.get<AnswerFactory>(AnswerFactory);
    answerCommentFactory =
      moduleFixture.get<AnswerCommentFactory>(AnswerCommentFactory);
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[GET] /answers/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    });

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        authorId: user.id,
        answerId: answer.id,
        content: 'My first comment',
      }),
      answerCommentFactory.makePrismaAnswerComment({
        authorId: user.id,
        answerId: answer.id,
        content: 'My last comment',
      }),
    ]);

    const answerId = answer.id.toString();

    const response = await request(app.getHttpServer())
      .get(`/answers/${answerId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({ content: 'My last comment' }),
        expect.objectContaining({ content: 'My first comment' }),
      ]),
    });
  });
});
