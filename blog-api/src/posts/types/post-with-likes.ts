import { Like, Post, User } from '@prisma/client';

export type PostWithLikes = Post & {
    author: User;
    likes: Like[];
};
