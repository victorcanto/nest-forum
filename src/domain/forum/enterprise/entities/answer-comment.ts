import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Comment, CommentProps } from './comment';
import { Optional } from '@/core/types/optional';

export class AnswerComment extends Comment<AnswerCommentProps> {
  static create(
    props: Optional<AnswerCommentProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new AnswerComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  get answerId() {
    return this.props.answerId;
  }
}

export type AnswerCommentProps = {
  answerId: UniqueEntityId;
} & CommentProps;
