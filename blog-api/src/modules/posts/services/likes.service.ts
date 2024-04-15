// Common
import { Injectable } from '@nestjs/common';
// Services
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class LikesService {
    constructor(private readonly prismaService: PrismaService) {}

    async postHasUserLike(authorId: number, postId: number): Promise<boolean> {
        return (
            (await this.prismaService.like.findFirst({
                where: { authorId, postId },
            })) != null
        );
    }

    async like(authorId: number, postId: number): Promise<void> {
        await this.prismaService.like.create({
            data: {
                post: { connect: { id: postId } },
                author: { connect: { id: authorId } },
            },
        });
    }

    async unlike(authorId: number, postId: number): Promise<void> {
        await this.prismaService.like.delete({
            where: {
                postId,
                authorId,
            },
        });
    }
}
