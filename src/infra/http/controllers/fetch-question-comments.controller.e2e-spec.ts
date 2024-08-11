import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from '@/test/factories/make-student';
import { QuestionFactory } from '@/test/factories/make-question';
import { DatabaseModule } from '@/infra/database/database.module';
import { QuestionCommentFactory } from '@/test/factories/make-question-comment';

describe('Fetch question comments (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let questionCommentFactory: QuestionCommentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    questionCommentFactory = moduleFixture.get<QuestionCommentFactory>(
      QuestionCommentFactory,
    );
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[GET] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id,
        questionId: question.id,
        content: 'My first comment',
      }),
      questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id,
        questionId: question.id,
        content: 'My last comment',
      }),
    ]);

    const questionId = question.id.toString();

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/comments`)
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
