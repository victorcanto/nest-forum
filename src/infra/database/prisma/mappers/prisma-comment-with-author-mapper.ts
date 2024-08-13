import { Comment as PrismaComment, User as PrismaUser } from '@prisma/client';
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';

export class PrismaCommentWithAuthorMapper {
  static toDomain(raw: PrismaWithAuthor) {
    return CommentWithAuthor.create({
      commentId: new UniqueEntityId(raw.id),
      authorId: new UniqueEntityId(raw.authorId),
      author: raw.author.name,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}

type PrismaWithAuthor = PrismaComment & {
  author: PrismaUser;
};
