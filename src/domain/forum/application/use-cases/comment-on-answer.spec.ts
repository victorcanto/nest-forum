import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory/in-memory-answer-comments-repository';
import { CommentOnAnswerUseCase } from './comment-on-answer';
import { makeAnswer } from 'test/factories/make-answer';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  answerCommentsRepository: InMemoryAnswerCommentsRepository;
  sut: CommentOnAnswerUseCase;
};

const makeSut = (): SutTypes => {
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  );
  const answerCommentsRepository = new InMemoryAnswerCommentsRepository();
  const sut = new CommentOnAnswerUseCase(
    answersRepository,
    answerCommentsRepository,
  );
  return {
    answersRepository,
    answerCommentsRepository,
    sut,
  };
};

describe('Comment On Answer', () => {
  it('should be able to comment on answer', async () => {
    const { sut, answersRepository, answerCommentsRepository } = makeSut();
    const newAnswer = makeAnswer();
    await answersRepository.create(newAnswer);
    const result = await sut.execute({
      authorId: newAnswer.authorId.toString(),
      answerId: newAnswer.id.toString(),
      content: 'new comment',
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      answerComment: answerCommentsRepository.items[0],
    });
  });

  it('should throw if answer not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      authorId: 'author-1',
      answerId: 'answer-1',
      content: 'new comment',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
