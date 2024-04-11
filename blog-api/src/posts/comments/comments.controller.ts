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
    UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { UserWithToken } from 'src/users/types';
import { CommentDto, CreateCommentDto, UpdateCommentDto, mapToCommentDto } from './dto';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { PostsService } from 'src/posts/posts.service';
import { CommentWithUser } from './types';
import { PostWithLikes } from 'src/posts/types';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly postsService: PostsService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @Query('postId', ParseIntPipe) postId: number,
        @Query('authorId', ParseIntPipe) authorId: number,
    ): Promise<{ comments: CommentDto[] }> {
        const comments: CommentWithUser[] = await this.commentsService.getAll(postId, authorId);
        return { comments: comments.map((comment) => mapToCommentDto(comment)) };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async create(
        @User() user: UserWithToken,
        @Query('postId', ParseIntPipe) postId: number,
        @Body() dto: CreateCommentDto,
    ): Promise<{ comment: CommentDto }> {
        if (!postId) throw new BadRequestException('PostId query param is requered');
        const post: PostWithLikes = await this.postsService.getById(postId);
        if (post) throw new NotFoundException('Post with given id is not found');
        const comment: CommentWithUser = await this.commentsService.create(
            post.id,
            user.id,
            dto.description,
        );
        return { comment: mapToCommentDto(comment) };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) commentId: number,
    ): Promise<void> {
        const comment: CommentWithUser = await this.commentsService.getById(commentId);
        if (!comment) throw new NotFoundException('Comment with given id is not found');
        if (comment.author.id != user.id)
            throw new ForbiddenException('There is no permission to delete this post');
        await this.commentsService.remove(comment.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) commentId: number,
        @Body() dto: UpdateCommentDto,
    ): Promise<{ comment: CommentDto }> {
        let comment: CommentWithUser = await this.commentsService.getById(commentId);
        if (!comment) throw new NotFoundException('Comment with given id is not found');
        comment.description = dto.description;
        comment = await this.commentsService.update(comment);
        return { comment: mapToCommentDto(comment) };
    }
}
