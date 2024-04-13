import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { FilesService } from 'src/files/files.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { User } from 'src/auth/decorators/user.decorator';
import { UserWithToken } from 'src/users/types';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDto, mapToPostDto } from './dto/post.dto';
import { PostWithLikes } from './types';
import { LikesService } from './likes/likes.service';
import { ParseIntWithDefaultPipe } from 'src/pipes';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly fileService: FilesService,
        private readonly postsService: PostsService,
        private readonly likesService: LikesService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('media'))
    async create(
        @User() user: UserWithToken,
        @UploadedFile() media: Express.Multer.File,
        @Body() dto: CreatePostDto,
    ): Promise<{ post: PostDto }> {
        console.log(media);
        console.log(dto);
        if (!media) throw new BadRequestException('The "media" prop is required');
        const mediaFileName = await this.fileService.upload(media);
        const post: PostWithLikes = await this.postsService.create(
            user.id,
            mediaFileName,
            dto.title,
            dto.description,
        );
        return { post: mapToPostDto(post) };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @User() user: UserWithToken,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
        @Query('query') query?: string,
        @Query('author', new ParseIntWithDefaultPipe(null)) authorId?: number,
    ): Promise<{ posts: PostDto[] }> {
        const posts: PostWithLikes[] = await this.postsService.getAll(page, limit, query, authorId);
        return { posts: posts.map((post) => mapToPostDto(post, user)) };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<{ post: PostDto }> {
        const post: PostWithLikes = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (!(await this.postsService.hasView(user.id, post.id)))
            await this.postsService.view(user.id, post.id);
        return { post: mapToPostDto(post, user) };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async delete(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<void> {
        const post: PostWithLikes = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (post.author.id != user.id)
            throw new ForbiddenException('You do not have permission to delete this post');
        await this.postsService.delete(postId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async update(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) postId: number,
        @UploadedFile('media') media: Express.Multer.File,
        @Body() dto: UpdatePostDto,
    ): Promise<{ post: PostDto }> {
        let post: PostWithLikes = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (post.author.id != user.id)
            throw new ForbiddenException('You do not have permission to update this post');
        if (!media) {
            await this.fileService.remove(post.media);
            post.media = await this.fileService.upload(media);
        }
        if (dto.title) post.title = dto.title;
        if (dto.description) post.description = dto.description;
        post = await this.postsService.update(post);
        return { post: mapToPostDto(post) };
    }

    @Put(':id/like')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async like(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<void> {
        const post = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (await this.likesService.postHasUserLike(user.id, post.id))
            throw new BadRequestException('This user has already liked this post');
        await this.likesService.like(user.id, post.id);
    }

    @Put(':id/unlike')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async unlike(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<void> {
        const post = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (!(await this.likesService.postHasUserLike(user.id, post.id)))
            throw new BadRequestException('This user did not leave a like on this post');
        await this.likesService.unlike(user.id, post.id);
    }
}
