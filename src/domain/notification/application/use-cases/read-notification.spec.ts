import { InMemoryNotificationsRepository } from 'test/repositories/in-memory/in-memory-notifications-repository';
import { ReadNotificationUseCase } from './read-notification';
import { makeNotification } from 'test/factories/make-notification';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

type SutTypes = {
  notificationsRepository: InMemoryNotificationsRepository;
  sut: ReadNotificationUseCase;
};

const makeSut = (): SutTypes => {
  const notificationsRepository = new InMemoryNotificationsRepository();
  const sut = new ReadNotificationUseCase(notificationsRepository);
  return {
    notificationsRepository,
    sut,
  };
};

describe('Read Notification', () => {
  it('should be able to read a notification', async () => {
    const { sut, notificationsRepository } = makeSut();

    const notification1 = makeNotification();
    const notification2 = makeNotification();

    notificationsRepository.create(notification1);
    notificationsRepository.create(notification2);

    const result = await sut.execute({
      notificationId: notification1.id.toString(),
      recipientId: notification1.recipientId.toString(),
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      notification: notification1,
    });
    expect(notificationsRepository.items[0].readAt).toEqual(expect.any(Date));
  });

  it('should not be able to read a notification with wrong id', async () => {
    const { sut, notificationsRepository } = makeSut();

    const notification1 = makeNotification();
    const notification2 = makeNotification();

    notificationsRepository.create(notification1);
    notificationsRepository.create(notification2);

    const result = await sut.execute({
      notificationId: 'wrong_id',
      recipientId: notification1.recipientId.toString(),
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to read a notification with wrong recipient id', async () => {
    const { sut, notificationsRepository } = makeSut();

    const notification1 = makeNotification();
    const notification2 = makeNotification();

    notificationsRepository.create(notification1);
    notificationsRepository.create(notification2);

    const result = await sut.execute({
      notificationId: notification1.id.toString(),
      recipientId: 'wrong_recipient_id',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
