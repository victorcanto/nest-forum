import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class AnswerAttachment extends Entity<AnswerAttachmentProps> {
  static create(props: AnswerAttachmentProps, id?: UniqueEntityId) {
    return new AnswerAttachment(props, id);
  }

  get answerId() {
    return this.props.answerId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }
}

export type AnswerAttachmentProps = {
  answerId: UniqueEntityId;
  attachmentId: UniqueEntityId;
};
