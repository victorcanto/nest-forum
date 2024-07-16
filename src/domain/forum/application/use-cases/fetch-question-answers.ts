import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Either, right } from '@/core/either';

export class FetchQuestionAnswersUseCase {
  constructor(private readonly answersRepository: AnswersRepository) {}

  async execute({
    questionId,
    page = 1,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const answers = await this.answersRepository.findManyByQuestionId(
      questionId,
      { page },
    );

    return right({
      answers,
    });
  }
}

type FetchQuestionAnswersUseCaseRequest = {
  questionId: string;
  page: number;
};

type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    answers: Answer[];
  }
>;
