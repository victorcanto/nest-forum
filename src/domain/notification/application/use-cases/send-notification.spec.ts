import { InMemoryNotificationsRepository } from '@/test/repositories/in-memory/in-memory-notifications-repository';
import { SendNotificationUseCase } from './send-notification';

type SutTypes = {
  notificationsRepository: InMemoryNotificationsRepository;
  sut: SendNotificationUseCase;
};

const makeSut = (): SutTypes => {
  const notificationsRepository = new InMemoryNotificationsRepository();
  const sut = new SendNotificationUseCase(notificationsRepository);
  return {
    notificationsRepository,
    sut,
  };
};

describe('Send Notification', () => {
  it('should be able to send a notification', async () => {
    const { sut, notificationsRepository } = makeSut();
    const result = await sut.execute({
      recipientId: 'any_id',
      content: 'any_content',
      title: 'any_title',
    });
    expect(result.isRight()).toBe(true);
    expect(notificationsRepository.items[0]).toEqual(
      result.value?.notification,
    );
  });
});
