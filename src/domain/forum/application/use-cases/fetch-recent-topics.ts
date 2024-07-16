import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Either, right } from '@/core/either';

export class FetchRecentTopicsUseCase {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute({
    page = 1,
  }: FetchRecentTopicsUseCaseRequest): Promise<FetchRecentTopicsUseCaseResponse> {
    const questions = await this.questionsRepository.findManyRecent({
      page,
    });

    return right({
      questions,
    });
  }
}

type FetchRecentTopicsUseCaseRequest = {
  page: number;
};

type FetchRecentTopicsUseCaseResponse = Either<
  null,
  {
    questions: Question[];
  }
>;
