import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FollowersService {
    constructor(private readonly prismaService: PrismaService) {}

    async hasFollower(userId: number, followerId: number): Promise<boolean> {
        return (
            (await this.prismaService.follower.findUnique({
                where: { userId, followerId },
            })) != null
        );
    }

    async follow(userId: number, followerId: number): Promise<void> {
        await this.prismaService.follower.create({
            data: {
                user: { connect: { id: userId } },
                follower: { connect: { id: followerId } },
            },
        });
    }

    async unfollow(userId: number, followerId: number): Promise<void> {
        await this.prismaService.follower.delete({
            where: { userId, followerId },
        });
    }
}
