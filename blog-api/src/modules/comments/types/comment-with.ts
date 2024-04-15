import { Comment, User } from '@prisma/client';

export type CommentWith = Comment & {
    author: User;
};
