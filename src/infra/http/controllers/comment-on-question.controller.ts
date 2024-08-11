import { CurrentUser } from '../../auth/current-user.decorator';
import {
  BadRequestException,
  ConflictException,
  HttpCode,
  Param,
} from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question';

const answerQuestionBodySchema = z.object({
  content: z.string(),
});

type CommentOnQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(answerQuestionBodySchema);

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private readonly commentOnQuestion: CommentOnQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CommentOnQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body;

    const userId = user.sub;

    const result = await this.commentOnQuestion.execute({
      content,
      questionId,
      authorId: userId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
