import { AnswerCommentProps } from '@/domain/forum/enterprise/entities/answer-comment';
import { QuestionCommentProps } from '@/domain/forum/enterprise/entities/question-comment';
import { Comment } from '@/domain/forum/enterprise/entities/comment';

export class CommentPresenter {
  static toHTTP<T extends AnswerCommentProps | QuestionCommentProps>(
    comment: Comment<T>,
  ) {
    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
