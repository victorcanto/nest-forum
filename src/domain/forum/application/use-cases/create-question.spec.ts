import { InMemoryQuestionsRepository } from 'test/repositories/in-memory/in-memory-questions-repository';
import { CreateQuestionUseCase } from './create-question';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory/in-memory-question-attachments-repository';

type SutTypes = {
  questionsRepository: InMemoryQuestionsRepository;
  sut: CreateQuestionUseCase;
};

const makeSut = (): SutTypes => {
  const questionAttachmentsRepository =
    new InMemoryQuestionAttachmentsRepository();
  const questionsRepository = new InMemoryQuestionsRepository(
    questionAttachmentsRepository,
  );
  const sut = new CreateQuestionUseCase(questionsRepository);
  return {
    questionsRepository,
    sut,
  };
};

describe('Create Question', () => {
  it('should be able to create a question', async () => {
    const { sut, questionsRepository } = makeSut();
    const result = await sut.execute({
      authorId: '1',
      title: 'title',
      content: 'content',
      attachmentsIds: ['1', '2'],
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(questionsRepository.items[0]).toEqual(result.value?.question);
      expect(
        questionsRepository.items[0].attachments.currentItems,
      ).toHaveLength(2);
    }
    expect(questionsRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityId('2') }),
    ]);
  });
});
