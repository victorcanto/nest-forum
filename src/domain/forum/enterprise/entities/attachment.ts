import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class Attachment extends Entity<AttachmentProps> {
  static create(props: AttachmentProps, id?: UniqueEntityId) {
    return new Attachment(props, id);
  }

  get title() {
    return this.props.title;
  }

  get link() {
    return this.props.link;
  }
}

export type AttachmentProps = {
  title: string;
  link: string;
};
