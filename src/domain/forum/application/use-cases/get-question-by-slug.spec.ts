import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';
import { makeQuestion } from 'test/factories/make-question';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory/in-memory-attachments-repository';
import { makeStudent } from 'test/factories/make-student';
import { makeAttachment } from 'test/factories/make-attachment';
import { makeQuestionAttachment } from 'test/factories/make-question-attachment';

type SutTypes = {
  attachmentsRepository: InMemoryAttachmentsRepository;
  studentsRepository: InMemoryStudentsRepository;
  questionsRepository: InMemoryQuestionsRepository;
  questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
  sut: GetQuestionBySlugUseCase;
};

const makeSut = (): SutTypes => {
  const attachmentsRepository = new InMemoryAttachmentsRepository();
  const studentsRepository = new InMemoryStudentsRepository();
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
    attachmentsRepository,
    studentsRepository,
  );
  const sut = new GetQuestionBySlugUseCase(questionsRepository);
  return {
    attachmentsRepository,
    studentsRepository,
    questionsRepository,
    questionAttachmentsRepository,
    sut,
  };
};

describe('Get Question By Slug', () => {
  it('should be able to get a question by slug', async () => {
    const {
      sut,
      questionsRepository,
      studentsRepository,
      attachmentsRepository,
      questionAttachmentsRepository,
    } = makeSut();

    const student = makeStudent({ name: 'John Doe' });
    await studentsRepository.create(student);

    const newQuestion = makeQuestion({
      slug: Slug.create('example-question'),
      authorId: student.id,
    });

    await questionsRepository.create(newQuestion);

    const attachment = makeAttachment({
      title: 'Some attachment',
    });

    await attachmentsRepository.create(attachment);

    const questionAttachment = makeQuestionAttachment({
      attachmentId: attachment.id,
      questionId: newQuestion.id,
    });

    await questionAttachmentsRepository.createMany([questionAttachment]);

    const result = await sut.execute({
      slug: 'example-question',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        title: newQuestion.title,
        author: 'John Doe',
        attachments: [
          expect.objectContaining({
            title: 'Some attachment',
          }),
        ],
      }),
    });
  });
});
