import { CurrentUser } from '../../auth/current-user.decorator';
import {
  BadRequestException,
  HttpCode,
  Param,
  Put,
  Body,
  Controller,
} from '@nestjs/common';
import { z } from 'zod';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';

const editQuestionnBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type EditQuestionBodySchema = z.infer<typeof editQuestionnBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editQuestionnBodySchema);

@Controller('/questions/:id')
export class EditQuestionController {
  constructor(private readonly editQuestion: EditQuestionUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: EditQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const { title, content } = body;

    const userId = user.sub;

    const result = await this.editQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
      questionId,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }
  }
}
