import { makeQuestionComment } from 'test/factories/make-question-comment';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory/in-memory-question-comments-repository';
import { FetchQuestionCommentsUseCase } from './fetch-question-comments';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';
import { makeStudent } from 'test/factories/make-student';

type SutTypes = {
  studentsRepository: InMemoryStudentsRepository;
  questionCommentsRepository: InMemoryQuestionCommentsRepository;
  sut: FetchQuestionCommentsUseCase;
};

const makeSut = (): SutTypes => {
  const studentsRepository = new InMemoryStudentsRepository();
  const questionCommentsRepository = new InMemoryQuestionCommentsRepository(
    studentsRepository,
  );
  const sut = new FetchQuestionCommentsUseCase(questionCommentsRepository);
  return {
    studentsRepository,
    questionCommentsRepository,
    sut,
  };
};

describe('Fetch Question Answers', () => {
  it('should be able to fetch question questions', async () => {
    const { sut, studentsRepository, questionCommentsRepository } = makeSut();

    const student = makeStudent({ name: 'John Doe' });

    await studentsRepository.create(student);

    const comment1 = makeQuestionComment({
      questionId: new UniqueEntityId('question-1'),
      authorId: student.id,
    });

    const comment2 = makeQuestionComment({
      questionId: new UniqueEntityId('question-1'),
      authorId: student.id,
    });

    const comment3 = makeQuestionComment({
      questionId: new UniqueEntityId('question-1'),
      authorId: student.id,
    });

    await questionCommentsRepository.create(comment1);
    await questionCommentsRepository.create(comment2);
    await questionCommentsRepository.create(comment3);

    const result = await sut.execute({
      questionId: 'question-1',
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

  it('should be able to fetch paginated question questions', async () => {
    const { sut, studentsRepository, questionCommentsRepository } = makeSut();
    const student = makeStudent({ name: 'John Doe' });
    await studentsRepository.create(student);

    for (let i = 1; i <= 22; i++) {
      await questionCommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityId('question-1'),
          createdAt: new Date(`2024-01-${i}`),
          authorId: student.id,
        }),
      );
    }
    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    });
    expect(result.isRight()).toBe(true);
    expect(result.value?.comments).toHaveLength(2);
  });
});
