import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory/in-memory-answer-comments-repository';
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';
import { makeStudent } from 'test/factories/make-student';

type SutTypes = {
  studentsRepository: InMemoryStudentsRepository;
  answerCommentsRepository: InMemoryAnswerCommentsRepository;
  sut: FetchAnswerCommentsUseCase;
};

const makeSut = (): SutTypes => {
  const studentsRepository = new InMemoryStudentsRepository();
  const answerCommentsRepository = new InMemoryAnswerCommentsRepository(
    studentsRepository,
  );
  const sut = new FetchAnswerCommentsUseCase(answerCommentsRepository);
  return {
    studentsRepository,
    answerCommentsRepository,
    sut,
  };
};

describe('Fetch Answer Comments', () => {
  it('should be able to fetch question answers', async () => {
    const { sut, studentsRepository, answerCommentsRepository } = makeSut();

    const student = makeStudent({ name: 'John Doe' });

    await studentsRepository.create(student);

    const comment1 = makeAnswerComment({
      answerId: new UniqueEntityId('answer-1'),
      authorId: student.id,
    });

    const comment2 = makeAnswerComment({
      answerId: new UniqueEntityId('answer-1'),
      authorId: student.id,
    });

    const comment3 = makeAnswerComment({
      answerId: new UniqueEntityId('answer-1'),
      authorId: student.id,
    });

    await answerCommentsRepository.create(comment1);
    await answerCommentsRepository.create(comment2);
    await answerCommentsRepository.create(comment3);

    const result = await sut.execute({
      answerId: 'answer-1',
      page: 1,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(3);
    expect(result.value?.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment1.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment2.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment3.id,
        }),
      ]),
    );
  });

  it('should be able to fetch paginated question answers', async () => {
    const { sut, studentsRepository, answerCommentsRepository } = makeSut();
    const student = makeStudent({ name: 'John Doe' });
    await studentsRepository.create(student);

    for (let i = 1; i <= 22; i++) {
      await answerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityId('answer-1'),
          createdAt: new Date(`2024-01-${i}`),
          authorId: student.id,
        }),
      );
    }
    const result = await sut.execute({
      answerId: 'answer-1',
      page: 2,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(2);
  });
});
