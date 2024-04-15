// Common
import { Injectable } from '@nestjs/common';
// Services
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { TokenWith } from '../types';
// Types

@Injectable()
export class TokensService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, token: string, exp: Date): Promise<TokenWith> {
        return (await this.prismaService.token.create({
            data: { userId, token, exp },
        })) as TokenWith;
    }

    async update(userId: number, token: string, exp: Date): Promise<TokenWith> {
        return (await this.prismaService.token.update({
            where: { userId },
            data: { token, exp },
        })) as TokenWith;
    }

    async remove(userId: number): Promise<void> {
        this.prismaService.token.delete({
            where: { userId },
        });
    }

    async getByUserId(userId: number): Promise<TokenWith> {
        return (await this.prismaService.token.findUnique({
            where: { userId },
            include: { user: true },
        })) as TokenWith;
    }

    async getByToken(token: string): Promise<TokenWith> {
        return (await this.prismaService.token.findUnique({
            where: { token },
            include: { user: true },
        })) as TokenWith;
    }
}
