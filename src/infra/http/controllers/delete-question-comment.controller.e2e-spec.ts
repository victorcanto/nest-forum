import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from 'test/factories/make-student';
import { QuestionFactory } from 'test/factories/make-question';
import { QuestionCommentFactory } from 'test/factories/make-question-comment';

describe('Delete question comment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let questionFactory: QuestionFactory;
  let questionCommentFactory: QuestionCommentFactory;
  let studentFactory: StudentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    questionCommentFactory = moduleFixture.get<QuestionCommentFactory>(
      QuestionCommentFactory,
    );
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[DELETE] /questions/comments/:id', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const questionComment =
      await questionCommentFactory.makePrismaQuestionComment({
        authorId: user.id,
        questionId: question.id,
      });

    const questionCommentId = questionComment.id.toString();

    const response = await request(app.getHttpServer())
      .delete(`/questions/comments/${questionCommentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(204);

    const commentOnDatabase = await prisma.comment.findUnique({
      where: {
        id: questionCommentId,
      },
    });

    expect(commentOnDatabase).toBeNull();
  });
});
