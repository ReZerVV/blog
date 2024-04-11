import { Token, User } from '@prisma/client';

export type TokenWithUser = Token & {
    user: User;
};
