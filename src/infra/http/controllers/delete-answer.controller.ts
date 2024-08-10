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
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer';
import { ResourceNotFoundError } from '@/domain/forum/application/use-cases/errors/resource-not-found-error';
import { NotAllowedError } from '@/domain/forum/application/use-cases/errors/not-allowed-error';

@Controller('/answers/:id')
export class DeleteAnswerController {
  constructor(private readonly deleteAnswer: DeleteAnswerUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') answerId: string,
  ) {
    const userId = user.sub;

    const result = await this.deleteAnswer.execute({
      authorId: userId,
      answerId,
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
