import { PrismaQuestionMapper } from './../mappers/prisma-question-mapper';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: {
        id,
      },
    });

    if (!question) {
      return null;
    }

    return PrismaQuestionMapper.toDomain(question);
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: {
        slug,
      },
    });

    if (!question) {
      return null;
    }

    return PrismaQuestionMapper.toDomain(question);
  }

  async findManyRecent(params: PaginationParams): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      skip: (params.page - 1) * 20,
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return questions.map(PrismaQuestionMapper.toDomain);
  }

  async save(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);

    await this.prisma.question.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async create(question: Question): Promise<void> {
    const data = PrismaQuestionMapper.toPrisma(question);

    await this.prisma.question.create({
      data,
    });
  }

  async delete(question: Question): Promise<void> {
    await this.prisma.question.delete({
      where: {
        id: question.id.toString(),
      },
    });
  }
}
