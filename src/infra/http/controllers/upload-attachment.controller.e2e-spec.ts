import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { StudentFactory } from 'test/factories/make-student';
import { DatabaseModule } from '@/infra/database/database.module';
import { QuestionFactory } from 'test/factories/make-question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';

describe('Upload attachment (e2e)', () => {
  let app: INestApplication;
  let studentFactory: StudentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[POST] /attachments', async () => {
    const user = await studentFactory.makePrismaStudent();
    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/attachments')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', './test/upload/sample-upload.png');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      attachmentId: expect.any(String),
    });
  });
});
