import { Notification } from '@/domain/notification/enterprise/entities/notification';

export interface NotificationsRepository {
  findById(notificationId: string): Promise<Notification | null>;
  create(notification: Notification): Promise<void>;
  save(notification: Notification): Promise<void>;
}
