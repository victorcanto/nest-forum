import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory/in-memory-question-comments-repository';
import { makeQuestionComment } from 'test/factories/make-question-comment';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { DeleteQuestionCommentUseCase } from './delete-question-comment';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';

type SutTypes = {
  questionCommentsRepository: InMemoryQuestionCommentsRepository;
  sut: DeleteQuestionCommentUseCase;
};

const makeSut = (): SutTypes => {
  const studentsRepository = new InMemoryStudentsRepository();
  const questionCommentsRepository = new InMemoryQuestionCommentsRepository(
    studentsRepository,
  );
  const sut = new DeleteQuestionCommentUseCase(questionCommentsRepository);
  return {
    questionCommentsRepository,
    sut,
  };
};

describe('Delete answer Comment', () => {
  it('should be able to delete a question comment', async () => {
    const { sut, questionCommentsRepository } = makeSut();
    const newQuestionComment = makeQuestionComment({
      authorId: new UniqueEntityId('author-1'),
      questionId: new UniqueEntityId('question-1'),
    });
    await questionCommentsRepository.create(newQuestionComment);
    await sut.execute({
      questionCommentId: newQuestionComment.id.toString(),
      authorId: 'author-1',
    });
    expect(questionCommentsRepository.items).toHaveLength(0);
  });

  it('should throws if question comment not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      questionCommentId: 'question-comment-1',
      authorId: 'author-1',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a question comment from another user', async () => {
    const { sut, questionCommentsRepository } = makeSut();
    const newQuestionComment = makeQuestionComment({
      authorId: new UniqueEntityId('author-1'),
      questionId: new UniqueEntityId('question-1'),
    });
    await questionCommentsRepository.create(newQuestionComment);
    const result = await sut.execute({
      questionCommentId: newQuestionComment.id.toString(),
      authorId: 'author-2',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
