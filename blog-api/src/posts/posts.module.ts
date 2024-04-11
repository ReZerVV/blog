import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsController } from './comments/comments.controller';
import { LikesService } from './likes/likes.service';

@Module({
    imports: [],
    providers: [PostsService, CommentsService, LikesService],
    controllers: [PostsController, CommentsController],
})
export class PostsModule {}
