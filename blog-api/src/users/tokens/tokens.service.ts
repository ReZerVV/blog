import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenWithUser } from './types';

@Injectable()
export class TokensService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, token: string, exp: Date): Promise<TokenWithUser> {
        return (await this.prismaService.token.create({
            data: { userId, token, exp },
        })) as TokenWithUser;
    }

    async update(userId: number, token: string, exp: Date): Promise<TokenWithUser> {
        return (await this.prismaService.token.update({
            where: { userId },
            data: { token, exp },
        })) as TokenWithUser;
    }

    async remove(userId: number): Promise<void> {
        this.prismaService.token.delete({
            where: { userId },
        });
    }

    async getByUserId(userId: number): Promise<TokenWithUser> {
        return (await this.prismaService.token.findUnique({
            where: { userId },
            include: { user: true },
        })) as TokenWithUser;
    }

    async getByToken(token: string): Promise<TokenWithUser> {
        return (await this.prismaService.token.findUnique({
            where: { token },
            include: { user: true },
        })) as TokenWithUser;
    }
}
