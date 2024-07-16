import { Either, left, right } from '@/core/either';
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

export class DeleteAnswerCommentUseCase {
  constructor(
    private readonly questionAnswersRepository: AnswerCommentsRepository,
  ) {}

  async execute({
    answerCommentId,
    authorId,
  }: DeleteAnswerCommentUseCaseRequest): Promise<DeleteAnswerCommentUseCaseResponse> {
    const answerComment =
      await this.questionAnswersRepository.findById(answerCommentId);

    if (!answerComment) {
      return left(new ResourceNotFoundError());
    }

    if (authorId !== answerComment.authorId.toString()) {
      return left(new NotAllowedError());
    }

    await this.questionAnswersRepository.delete(answerComment);
    return right(null);
  }
}

type DeleteAnswerCommentUseCaseRequest = {
  answerCommentId: string;
  authorId: string;
};

type DeleteAnswerCommentUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>;
