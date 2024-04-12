import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowersService } from './followers/followers.service';
import { TokensService } from './tokens/tokens.service';
import { UsersController } from './users.controller';
import { ProfileController } from './profile/profile.controller';

@Module({
    imports: [PrismaModule],
    providers: [UsersService, PrismaService, FollowersService, TokensService],
    controllers: [UsersController, ProfileController],
    exports: [UsersService, TokensService],
})
export class UsersModule {}
