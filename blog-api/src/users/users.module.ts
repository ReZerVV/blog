import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileController } from './profile/profile.controller';
import { FollowersService } from './followers/followers.service';
import { TokensService } from './tokens/tokens.service';

@Module({
    imports: [PrismaModule],
    providers: [UsersService, PrismaService, FollowersService, TokensService],
    controllers: [UsersController, ProfileController],
    exports: [UsersService],
})
export class UsersModule {}
