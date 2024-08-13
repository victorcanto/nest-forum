import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from 'test/factories/make-student';
import { DatabaseModule } from '@/infra/database/database.module';
import { QuestionFactory } from 'test/factories/make-question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { AttachmentFactory } from 'test/factories/make-attachment';
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachment';

describe('Get question by slug (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;
  let questionAttachmentFactory: QuestionAttachmentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    questionFactory = moduleFixture.get<QuestionFactory>(QuestionFactory);
    attachmentFactory = moduleFixture.get<AttachmentFactory>(AttachmentFactory);
    questionAttachmentFactory = moduleFixture.get<QuestionAttachmentFactory>(
      QuestionAttachmentFactory,
    );
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[GET] /questions/:slug', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    });
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      title: 'My first question',
      slug: Slug.create('my-first-question'),
      authorId: user.id,
    });

    const attachment = await attachmentFactory.makePrismaAttachment({
      title: 'Some attachment',
    });

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id,
      attachmentId: attachment.id,
    });

    const response = await request(app.getHttpServer())
      .get('/questions/my-first-question')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      question: expect.objectContaining({
        title: 'My first question',
        author: 'John Doe',
        attachments: expect.arrayContaining([
          expect.objectContaining({
            title: 'Some attachment',
          }),
        ]),
      }),
    });
  });
});
