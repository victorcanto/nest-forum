import { UniqueEntityId } from './unique-entity-id';

export abstract class Entity<Props> {
  private _id: UniqueEntityId;
  protected props: Props;

  protected constructor(props: Props, id?: UniqueEntityId) {
    this.props = props;
    this._id = id ?? new UniqueEntityId();
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  public equals(entity?: Entity<Props>): boolean {
    if (entity === this || entity?.id === this._id) {
      return true;
    }
    return false;
  }
}
