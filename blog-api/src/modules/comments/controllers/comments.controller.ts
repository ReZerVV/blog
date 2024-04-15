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
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { User } from 'src/modules/auth/decorators/user.decorator';
// Services
import { CommentsService } from '../services/comments.service';
import { PostsService } from 'src/modules/posts/services/posts.service';
// Types & Dtos
import { UserWith } from 'src/modules/users/types';
import {
    CommentDto,
    CreateCommentRequest,
    CreateCommentResponse,
    GetAllCommentResponse,
    UpdateCommentRequest,
    UpdateCommentResponse,
    mapToCommentDto,
} from '../dto';
import { CommentWith } from '../types';
import { PostWith } from 'src/modules/posts/types';
import { ParseIntWithDefaultPipe } from 'src/pipes';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('comments')
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly postsService: PostsService,
    ) {}

    @ApiResponse({ status: 200, type: GetAllCommentResponse })
    @ApiQuery({ name: 'postId', required: false })
    @ApiQuery({ name: 'authorId', required: false })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @Query('postId', new ParseIntWithDefaultPipe(null)) postId?: number,
        @Query('authorId', new ParseIntWithDefaultPipe(null)) authorId?: number,
    ): Promise<GetAllCommentResponse> {
        const comments: CommentWith[] = await this.commentsService.getAll(postId, authorId);
        return { comments: comments.map((comment) => mapToCommentDto(comment)) };
    }

    @ApiResponse({ status: 201, type: CreateCommentResponse })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @User() user: UserWith,
        @Body() request: CreateCommentRequest,
    ): Promise<CreateCommentResponse> {
        const post: PostWith = await this.postsService.getById(request.postId);
        if (!post) throw new NotFoundException('Post with given id is not found');
        const comment: CommentWith = await this.commentsService.create(
            post.id,
            user.id,
            request.description,
        );
        return { comment: mapToCommentDto(comment) };
    }

    @ApiResponse({ status: 204 })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @User() user: UserWith,
        @Param('id', ParseIntPipe) commentId: number,
    ): Promise<void> {
        const comment: CommentWith = await this.commentsService.getById(commentId);
        if (!comment) throw new NotFoundException('Comment with given id is not found');
        if (comment.author.id != user.id)
            throw new ForbiddenException('There is no permission to delete this post');
        await this.commentsService.remove(comment.id);
    }

    @ApiResponse({ status: 201, type: UpdateCommentResponse })
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @User() user: UserWith,
        @Param('id', ParseIntPipe) commentId: number,
        @Body() request: UpdateCommentRequest,
    ): Promise<UpdateCommentResponse> {
        let comment: CommentWith = await this.commentsService.getById(commentId);
        if (!comment) throw new NotFoundException('Comment with given id is not found');
        comment.description = request.description;
        comment = await this.commentsService.update(comment);
        return { comment: mapToCommentDto(comment) };
    }
}
