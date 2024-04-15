import { Injectable } from '@nestjs/common';
import { CommentWith } from '../types';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(postId: number, authorId: number, description: string): Promise<CommentWith> {
        return (await this.prismaService.comment.create({
            data: {
                post: { connect: { id: postId } },
                author: { connect: { id: authorId } },
                description,
            },
            include: { author: true },
        })) as CommentWith;
    }

    async remove(commentId: number): Promise<void> {
        await this.prismaService.comment.delete({
            where: { id: commentId },
        });
    }

    async update(comment: CommentWith): Promise<CommentWith> {
        const { id, authorId, author, postId, ...data } = comment;
        return (await this.prismaService.comment.update({
            where: { id },
            data,
            include: { author: true },
        })) as CommentWith;
    }

    async getAll(postId: number = null, authorId: number = null): Promise<CommentWith[]> {
        return (await this.prismaService.comment.findMany({
            where: {
                ...(postId && { postId: { equals: postId } }),
                ...(authorId && { authorId: { equals: authorId } }),
            },
            include: { author: true },
        })) as CommentWith[];
    }

    async getById(commentId: number): Promise<CommentWith | null> {
        return (await this.prismaService.comment.findUnique({
            where: { id: commentId },
            include: { author: true },
        })) as CommentWith;
    }
}
