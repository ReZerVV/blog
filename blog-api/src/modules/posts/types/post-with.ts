import { Like, Post, User, View } from '@prisma/client';

export type PostWith = Post & {
    author: User;
    likes: Like[];
    veiws: View[];
};
