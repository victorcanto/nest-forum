import { CurrentUser } from '../../auth/current-user.decorator';
import {
  BadRequestException,
  HttpCode,
  Param,
  Controller,
  Delete,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question';
import { ResourceNotFoundError } from '@/domain/forum/application/use-cases/errors/resource-not-found-error';
import { NotAllowedError } from '@/domain/forum/application/use-cases/errors/not-allowed-error';

@Controller('/questions/:id')
export class DeleteQuestionController {
  constructor(private readonly deleteQuestion: DeleteQuestionUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const userId = user.sub;

    const result = await this.deleteQuestion.execute({
      authorId: userId,
      questionId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new UnauthorizedException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}
