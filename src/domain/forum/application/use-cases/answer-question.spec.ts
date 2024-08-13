import { InMemoryAnswersRepository } from 'test/repositories/in-memory/in-memory-answers-repository';
import { AnswerQuestionUseCase } from './answer-question';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory/in-memory-answer-attachments-repository';

type SutTypes = {
  answersRepository: InMemoryAnswersRepository;
  answerAttachmentsRespository: InMemoryAnswerAttachmentsRepository;
  sut: AnswerQuestionUseCase;
};

const makeSut = (): SutTypes => {
  const answerAttachmentsRespository =
    new InMemoryAnswerAttachmentsRepository();
  const answersRepository = new InMemoryAnswersRepository(
    answerAttachmentsRespository,
  );
  const sut = new AnswerQuestionUseCase(answersRepository);
  return {
    answersRepository,
    answerAttachmentsRespository,
    sut,
  };
};

describe('Answer Question', () => {
  it('should be able to answer a question', async () => {
    const { sut, answersRepository } = makeSut();
    const result = await sut.execute({
      authorId: '1',
      questionId: '1',
      content: 'content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isRight()).toBe(true);
    expect(answersRepository.items[0]).toEqual(result.value?.answer);
    expect(answersRepository.items[0].attachments.currentItems).toHaveLength(2);
    expect(answersRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityId('2') }),
    ]);
  });

  it('should persist attachments when creating a new answer', async () => {
    const { sut, answerAttachmentsRespository } = makeSut();
    const result = await sut.execute({
      authorId: '1',
      questionId: '1',
      content: 'content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isRight()).toBe(true);
    expect(answerAttachmentsRespository.items).toHaveLength(2);
    expect(answerAttachmentsRespository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityId('2') }),
      ]),
    );
  });
});
