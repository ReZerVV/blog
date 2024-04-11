import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostWithLikes } from './types';

@Injectable()
export class PostsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        userId: number,
        media: string,
        title: string,
        description: string,
    ): Promise<PostWithLikes> {
        const post: PostWithLikes = (await this.prismaService.post.create({
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
            },
        })) as PostWithLikes;
        return post;
    }

    async getAll(
        page: number,
        limit: number,
        query: string = null,
        authorid: number = null,
    ): Promise<PostWithLikes[]> {
        return await this.prismaService.post.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                ...(query && { title: { contains: query } }),
                ...(authorid && { author: { id: { equals: authorid } } }),
            },
            include: {
                comments: true,
                likes: true,
                author: true,
            },
        });
    }

    async getById(postId: number): Promise<PostWithLikes | null> {
        return await this.prismaService.post.findUnique({
            where: { id: postId },
            include: {
                comments: true,
                likes: true,
                author: true,
            },
        });
    }

    async delete(postId: number): Promise<void> {
        await this.prismaService.post.delete({
            where: { id: postId },
        });
    }

    async update(post: PostWithLikes): Promise<PostWithLikes> {
        const { id, author, likes, ...data } = post;
        return (await this.prismaService.post.update({
            where: { id },
            data,
            include: {
                comments: true,
                likes: true,
                author: true,
            },
        })) as PostWithLikes;
    }
}
