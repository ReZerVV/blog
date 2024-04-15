// Common
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
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { ParseIntWithDefaultPipe } from 'src/pipes';
// Services
import { PostsService } from '../services/posts.service';
import { FilesService } from 'src/modules/files/services/files.service';
import { LikesService } from '../services/likes.service';
// Types & Dtos
import { UserWith } from 'src/modules/users/types';
import { PostWith } from '../types';
import { mapToPostDto } from '../dto/post.dto';
import {
    CreatePostRequest,
    CreatePostResponse,
    GetAllPostResponse,
    GetByIdResponse,
    UpdatePostResponse,
    UpdatePostRequest,
} from '../dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
    constructor(
        private readonly fileService: FilesService,
        private readonly postsService: PostsService,
        private readonly likesService: LikesService,
    ) {}

    @ApiResponse({ status: 201, type: CreatePostResponse })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('media'))
    async create(
        @User() user: UserWith,
        @UploadedFile() media: Express.Multer.File,
        @Body() request: CreatePostRequest,
    ): Promise<CreatePostResponse> {
        console.log(request);
        if (!media) throw new BadRequestException('The "media" prop is required');
        const mediaFileName = await this.fileService.upload(media);
        const post: PostWith = await this.postsService.create(
            user.id,
            mediaFileName,
            request.title,
            request.description,
        );
        return { post: mapToPostDto(post) };
    }

    @ApiResponse({ status: 200, type: GetAllPostResponse })
    @ApiQuery({ name: 'page', required: true })
    @ApiQuery({ name: 'limit', required: true })
    @ApiQuery({ name: 'query', required: false })
    @ApiQuery({ name: 'favorites-for', required: false })
    @ApiQuery({ name: 'author', required: false })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @User() user: UserWith,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
        @Query('query') query?: string,
        @Query('favorites-for', new ParseIntWithDefaultPipe(null)) favoritesFor?: number,
        @Query('author', new ParseIntWithDefaultPipe(null)) authorId?: number,
    ): Promise<GetAllPostResponse> {
        const posts: PostWith[] = await this.postsService.getAll(
            page,
            limit,
            query,
            favoritesFor,
            authorId,
        );
        return { posts: posts.map((post) => mapToPostDto(post, user)) };
    }

    @ApiResponse({ status: 200, type: GetByIdResponse })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(
        @User() user: UserWith,
        @Param('id', ParseIntPipe) postId: number,
    ): Promise<GetByIdResponse> {
        const post: PostWith = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (!(await this.postsService.hasView(user.id, post.id)))
            await this.postsService.view(user.id, post.id);
        return { post: mapToPostDto(post, user) };
    }

    @ApiResponse({ status: 204 })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@User() user: UserWith, @Param('id', ParseIntPipe) postId: number): Promise<void> {
        const post: PostWith = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (post.author.id != user.id)
            throw new ForbiddenException('You do not have permission to delete this post');
        await this.postsService.delete(postId);
    }

    @ApiResponse({ status: 200, type: UpdatePostResponse })
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @User() user: UserWith,
        @Param('id', ParseIntPipe) postId: number,
        @UploadedFile('media') media: Express.Multer.File,
        @Body() request: UpdatePostRequest,
    ): Promise<UpdatePostResponse> {
        let post: PostWith = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (post.author.id != user.id)
            throw new ForbiddenException('You do not have permission to update this post');
        if (!media) {
            await this.fileService.delete(post.media);
            post.media = await this.fileService.upload(media);
        }
        if (request.title) post.title = request.title;
        if (request.description) post.description = request.description;
        post = await this.postsService.update(post);
        return { post: mapToPostDto(post) };
    }

    @ApiResponse({ status: 204 })
    @Put(':id/like')
    @HttpCode(HttpStatus.NO_CONTENT)
    async like(@User() user: UserWith, @Param('id', ParseIntPipe) postId: number): Promise<void> {
        const post = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (await this.likesService.postHasUserLike(user.id, post.id))
            throw new BadRequestException('This user has already liked this post');
        await this.likesService.like(user.id, post.id);
    }

    @ApiResponse({ status: 204 })
    @Put(':id/unlike')
    @HttpCode(HttpStatus.NO_CONTENT)
    async unlike(@User() user: UserWith, @Param('id', ParseIntPipe) postId: number): Promise<void> {
        const post = await this.postsService.getById(postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        if (!(await this.likesService.postHasUserLike(user.id, post.id)))
            throw new BadRequestException('This user did not leave a like on this post');
        await this.likesService.unlike(user.id, post.id);
    }
}
