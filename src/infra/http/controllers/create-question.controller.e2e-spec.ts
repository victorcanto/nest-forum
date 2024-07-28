import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/infra/app.module';
import request from 'supertest';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from '@/infra/database/database.module';
import { StudentFactory } from '@/test/factories/make-student';
import { QuestionFactory } from '@/test/factories/make-question';

describe('Create question (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentFactory: StudentFactory;
  let jwt: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    studentFactory = moduleFixture.get<StudentFactory>(StudentFactory);
    jwt = moduleFixture.get(JwtService);
    await app.init();
  });

  it('[POST] /questions', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'My question',
        content: 'My content',
      });

    expect(response.status).toBe(201);

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'My question',
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });
});
