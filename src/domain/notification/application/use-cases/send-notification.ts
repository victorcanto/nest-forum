import { Either, right } from '@/core/either';
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository';
import { Notification } from '../../enterprise/entities/notification';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class SendNotificationUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    recipientId,
    title,
    content,
  }: SendNotificationRequest): Promise<SendNotificationResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityId(recipientId),
      title,
      content,
    });
    await this.notificationsRepository.create(notification);

    return right({
      notification,
    });
  }
}

type SendNotificationRequest = {
  recipientId: string;
  title: string;
  content: string;
};

type SendNotificationResponse = Either<null, { notification: Notification }>;
