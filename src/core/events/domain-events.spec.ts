import { DomainEvent } from '../events/domain-event';
import { UniqueEntityId } from '../entities/unique-entity-id';
import { AggregateRoot } from '../entities/aggregate-root';
import { DomainEvents } from '@/core/events/domain-events';
import { vi } from 'vitest';

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date;
  private aggregate: CustomAggregate;

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate;
    this.ocurredAt = new Date();
  }

  public getAggregateId(): UniqueEntityId {
    return this.aggregate.id;
  }
}

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null);

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

    return aggregate;
  }
}

describe('Domain events', () => {
  it('should be able to dispatch and listen to events', async () => {
    const callbackSpy = vi.fn();

    DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

    const aggregate = CustomAggregate.create();

    expect(aggregate.domainEvents).toHaveLength(1);

    DomainEvents.dispatchEventsForAggregate(aggregate.id);

    expect(callbackSpy).toHaveBeenCalled();

    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
