// Common
import { Module } from '@nestjs/common';
// Modules
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
// Custom modules
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FilesModule } from './modules/files/files.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
// Other
import { join } from 'path';

@Module({
    imports: [
        // Modules
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
            exclude: ['/api/(.*)'],
        }),
        // Custom modules
        FilesModule,
        PostsModule,
        UsersModule,
        AuthModule,
        PrismaModule,
        CommentsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
