import { Token, User } from '@prisma/client';

export type TokenWith = Token & {
    user: User;
};
