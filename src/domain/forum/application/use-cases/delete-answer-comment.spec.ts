import { InMemoryAnswerCommentsRepository } from '@/test/repositories/in-memory/in-memory-answer-comments-repository';
import { makeAnswerComment } from '@/test/factories/make-answer-comment';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { DeleteAnswerCommentUseCase } from './delete-answer-comment';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

type SutTypes = {
  answerCommentsRepository: InMemoryAnswerCommentsRepository;
  sut: DeleteAnswerCommentUseCase;
};

const makeSut = (): SutTypes => {
  const answerCommentsRepository = new InMemoryAnswerCommentsRepository();
  const sut = new DeleteAnswerCommentUseCase(answerCommentsRepository);
  return {
    answerCommentsRepository,
    sut,
  };
};

describe('Delete Answer Comment', () => {
  it('should be able to delete a answer comment', async () => {
    const { sut, answerCommentsRepository } = makeSut();
    const newAnswerComment = makeAnswerComment({
      authorId: new UniqueEntityId('author-1'),
      answerId: new UniqueEntityId('answer-1'),
    });
    await answerCommentsRepository.create(newAnswerComment);
    await sut.execute({
      answerCommentId: newAnswerComment.id.toString(),
      authorId: 'author-1',
    });
    expect(answerCommentsRepository.items).toHaveLength(0);
  });

  it('should throws if answer comment not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      answerCommentId: 'answer-comment-1',
      authorId: 'author-1',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a answer comment from another user', async () => {
    const { sut, answerCommentsRepository } = makeSut();
    const newAnswerComment = makeAnswerComment({
      authorId: new UniqueEntityId('author-1'),
      answerId: new UniqueEntityId('answer-1'),
    });
    await answerCommentsRepository.create(newAnswerComment);
    const result = await sut.execute({
      answerCommentId: newAnswerComment.id.toString(),
      authorId: 'author-2',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
