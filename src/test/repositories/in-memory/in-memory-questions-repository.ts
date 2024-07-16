import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository';
import { DomainEvents } from '@/core/events/domain-events';

export class InMemoryQuestionsRepository implements QuestionsRepository {
  public items: Question[] = [];

  constructor(
    private readonly questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Question | null> {
    const question = this.items.find((item) => item.id.toString() === id);
    if (!question) {
      return null;
    }
    return question;
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = this.items.find((item) => item.slug.value === slug);
    if (!question) {
      return null;
    }
    return question;
  }

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const questions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);
    return questions;
  }

  async save(question: Question): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === question.id.toString(),
    );
    this.items[index] = question;
    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async create(question: Question): Promise<void> {
    this.items.push(question);
    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async delete(question: Question): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === question.id.toString(),
    );
    this.items.splice(index, 1);
    this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString(),
    );
  }
}
