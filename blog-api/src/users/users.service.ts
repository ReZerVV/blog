import { Injectable } from '@nestjs/common';
import { UserWithToken } from './types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAll(email: string = null): Promise<UserWithToken[]> {
        return this.prismaService.user.findMany({
            where: {
                ...(email && { email: { equals: email } }),
            },
            include: { token: true },
        });
    }

    async getById(id: number): Promise<UserWithToken> {
        return this.prismaService.user.findUnique({
            where: { id },
            include: { token: true },
        });
    }

    async getByEmail(email: string): Promise<UserWithToken> {
        return this.prismaService.user.findUnique({
            where: { email },
            include: { token: true },
        });
    }

    async update(user: UserWithToken): Promise<UserWithToken> {
        const { id, email, token, passwordHash, ...data } = user;
        return (await this.prismaService.user.update({
            where: { id },
            data,
            include: { token: true },
        })) as UserWithToken;
    }

    async remove(userId: number): Promise<void> {
        await this.prismaService.user.delete({
            where: { id: userId },
        });
    }

    async create(
        email: string,
        firstName: string,
        lastName: string,
        passwordHash: string,
    ): Promise<User> {
        return this.prismaService.user.create({
            data: { email, firstName, lastName, passwordHash },
        });
    }
}
