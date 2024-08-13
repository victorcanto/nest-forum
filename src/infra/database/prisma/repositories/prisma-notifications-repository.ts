import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository';
import { Notification } from '@/domain/notification/enterprise/entities/notification';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  findById(notificationId: string): Promise<Notification | null> {
    throw new Error('Method not implemented.');
  }
  create(notification: Notification): Promise<void> {
    throw new Error('Method not implemented.');
  }
  save(notification: Notification): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
