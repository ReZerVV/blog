import { Token, User } from '@prisma/client';

export type UserWith = User & {
    token: Token | null;
};
