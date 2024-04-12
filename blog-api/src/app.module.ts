import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { FilesModule } from './files/files.module';
import { PostsModule } from './posts/posts.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        PrismaModule,
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        AutomapperModule.forRoot({
            strategyInitializer: classes(),
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
            exclude: ['/api/(.*)'],
        }),
        FilesModule,
        PostsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
