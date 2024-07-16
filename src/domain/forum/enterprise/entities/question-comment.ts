import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Comment, CommentProps } from './comment';
import { Optional } from '@/core/types/optional';

export class QuestionComment extends Comment<QuestionCommentProps> {
  static create(
    props: Optional<QuestionCommentProps, 'createdAt'>,
    id?: UniqueEntityId,
  ) {
    return new QuestionComment(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  get questionId() {
    return this.props.questionId;
  }
}

export type QuestionCommentProps = {
  questionId: UniqueEntityId;
} & CommentProps;
