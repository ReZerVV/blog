// Common
import { Module } from '@nestjs/common';
// Controllers
import { PostsController } from './controllers/posts.controller';
// Services
import { PostsService } from './services/posts.service';
import { LikesService } from './services/likes.service';

@Module({
    imports: [],
    providers: [PostsService, LikesService],
    controllers: [PostsController],
    exports: [PostsService],
})
export class PostsModule {}
