import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer';
import { makeQuestion } from 'test/factories/make-question';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { makeAnswer } from 'test/factories/make-answer';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  answersRepository: InMemoryAnswersRepository;
  sut: ChooseQuestionBestAnswerUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRepository,
  );
  const sut = new ChooseQuestionBestAnswerUseCase(
    questionsRepository,
    answersRepository,
  );
  return {
    questionsRepository,
    answersRepository,
    sut,
  };
};

describe('Choose Question Best Answer', () => {
  it('should be able to choose a question best answer', async () => {
    const { sut, answersRepository, questionsRepository } = makeSut();
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
        slug: Slug.create('example-question'),
      },
      new UniqueEntityId('question-1'),
    );
    await questionsRepository.create(newQuestion);
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
        questionId: newQuestion.id,
        content: 'content',
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    const result = await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: 'author-1',
    });
    expect(result.isRight()).toBe(true);
    expect(questionsRepository.items[0].bestAnswerId).toEqual(newAnswer.id);
  });

  it('should throws if answer not found', async () => {
    const { sut } = makeSut();
    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throws if question not found', async () => {
    const { sut, answersRepository } = makeSut();
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
        questionId: new UniqueEntityId('question-1'),
        content: 'content',
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    const result = await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: 'author-1',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to choose a question best answer from another user', async () => {
    const { sut, answersRepository, questionsRepository } = makeSut();
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
        slug: Slug.create('example-question'),
      },
      new UniqueEntityId('question-1'),
    );
    await questionsRepository.create(newQuestion);
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
        questionId: newQuestion.id,
        content: 'content',
      },
      new UniqueEntityId('answer-1'),
    );
    await answersRepository.create(newAnswer);
    const result = await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: 'author-2',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
