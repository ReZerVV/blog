// Common
import { Injectable } from '@nestjs/common';
// Services
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
// Types & Dtos
import { PostWith } from '../types';
import { equal } from 'assert';

@Injectable()
export class PostsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        userId: number,
        media: string,
        title: string,
        description: string,
    ): Promise<PostWith> {
        const post: PostWith = (await this.prismaService.post.create({
            data: {
                author: { connect: { id: userId } },
                media,
                title,
                description,
            },
            include: {
                likes: true,
                comments: true,
                author: true,
                veiws: true,
            },
        })) as PostWith;
        return post;
    }

    async getAll(
        page: number,
        limit: number,
        query: string = null,
        favoritesFor: number = null,
        authorid: number = null,
    ): Promise<PostWith[]> {
        return await this.prismaService.post.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                ...(query && { title: { contains: query } }),
                ...(favoritesFor && { likes: { some: { authorId: { equals: favoritesFor } } } }),
                ...(authorid && { author: { id: { equals: authorid } } }),
            },
            include: {
                comments: true,
                likes: true,
                author: true,
                veiws: true,
            },
        });
    }

    async getById(postId: number): Promise<PostWith | null> {
        return await this.prismaService.post.findUnique({
            where: { id: postId },
            include: {
                comments: true,
                likes: true,
                veiws: true,
                author: true,
            },
        });
    }

    async delete(postId: number): Promise<void> {
        await this.prismaService.post.delete({
            where: { id: postId },
        });
    }

    async update(post: PostWith): Promise<PostWith> {
        const { id, author, likes, veiws, ...data } = post;
        return (await this.prismaService.post.update({
            where: { id },
            data,
            include: {
                comments: true,
                likes: true,
                author: true,
                veiws: true,
            },
        })) as PostWith;
    }

    async hasView(userId: number, postId: number): Promise<boolean> {
        return (
            (await this.prismaService.view.findUnique({
                where: {
                    authorId: userId,
                    postId,
                },
            })) != null
        );
    }

    async view(userId: number, postId: number): Promise<void> {
        await this.prismaService.view.create({
            data: {
                author: { connect: { id: userId } },
                post: { connect: { id: postId } },
            },
        });
    }
}
