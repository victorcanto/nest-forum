import { CurrentUser } from '../../auth/current-user.decorator';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { QuestionAlreadyExistsError } from '@/domain/forum/application/use-cases/errors/question-already-exists-error';

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  attachments: z.array(z.string().uuid()),
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema);

@Controller('/questions')
export class CreateQuestionController {
  constructor(private readonly createQuestion: CreateQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content, attachments } = body;

    const userId = user.sub;

    const result = await this.createQuestion.execute({
      authorId: userId,
      title,
      content,
      attachmentsIds: attachments,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case QuestionAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}
