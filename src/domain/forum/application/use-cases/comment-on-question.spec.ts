import { InMemoryQuestionsRepository } from '@/test/repositories/in-memory/in-memory-questions-repository';
import { InMemoryQuestionCommentsRepository } from '@/test/repositories/in-memory/in-memory-question-comments-repository';
import { InMemoryQuestionAttachmentsRepository } from '@/test/repositories/in-memory/in-memory-question-attachments-repository';
import { CommentOnQuestionUseCase } from './comment-on-question';
import { makeQuestion } from '@/test/factories/make-question';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  questionCommentsRepository: InMemoryQuestionCommentsRepository;
  sut: CommentOnQuestionUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const questionCommentsRepository = new InMemoryQuestionCommentsRepository();
  const sut = new CommentOnQuestionUseCase(
    questionsRepository,
    questionCommentsRepository,
  );
  return {
    questionsRepository,
    questionCommentsRepository,
    sut,
  };
};

describe('Comment On Question', () => {
  it('should be able to comment on question', async () => {
    const { sut, questionsRepository, questionCommentsRepository } = makeSut();
    const newQuestion = makeQuestion();
    await questionsRepository.create(newQuestion);
    const result = await sut.execute({
      authorId: newQuestion.authorId.toString(),
      questionId: newQuestion.id.toString(),
      content: 'new comment',
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      questionComment: questionCommentsRepository.items[0],
    });
  });

  it('should throw if question not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      authorId: 'author-1',
      questionId: 'question-1',
      content: 'new comment',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
