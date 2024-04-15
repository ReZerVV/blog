import { Module } from '@nestjs/common';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PostsModule } from '../posts/posts.module';

@Module({
    imports: [PrismaModule, PostsModule],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
