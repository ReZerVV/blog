import { Comment, User } from '@prisma/client';

export type CommentWithUser = Comment & {
    author: User;
};
