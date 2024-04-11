import { Injectable } from '@nestjs/common';
import { CommentWithUser } from './types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(postId: number, authorId: number, description: string): Promise<CommentWithUser> {
        return (await this.prismaService.comment.create({
            data: {
                post: { connect: { id: postId } },
                author: { connect: { id: authorId } },
                description,
            },
            include: { author: true },
        })) as CommentWithUser;
    }

    async remove(commentId: number): Promise<void> {
        await this.prismaService.comment.delete({
            where: { id: commentId },
        });
    }

    async update(comment: CommentWithUser): Promise<CommentWithUser> {
        const { id, authorId, author, postId, ...data } = comment;
        return (await this.prismaService.comment.update({
            where: { id },
            data,
            include: { author: true },
        })) as CommentWithUser;
    }

    async getAll(postId: number = null, authorId: number = null): Promise<CommentWithUser[]> {
        return (await this.prismaService.comment.findMany({
            where: {
                ...(postId && { postId: { equals: postId } }),
                ...(authorId && { authorId: { equals: authorId } }),
            },
            include: { author: true },
        })) as CommentWithUser[];
    }

    async getById(commentId: number): Promise<CommentWithUser | null> {
        return (await this.prismaService.comment.findUnique({
            where: { id: commentId },
            include: { author: true },
        })) as CommentWithUser;
    }
}
