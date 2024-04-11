import {
    BadRequestException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto, mapToUserDto } from './dto';
import { UserWithToken } from './types';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards';
import { FollowersService } from './followers/followers.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly followersService: FollowersService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(@Query('email') email: string): Promise<{ users: UserDto[] }> {
        const users = await this.usersService.getAll(email);
        return { users: users.map((user) => mapToUserDto(user)) };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id', ParseIntPipe) userId: number): Promise<{ user: UserDto }> {
        const user = await this.usersService.getById(userId);
        if (!user) throw new NotFoundException('User with given id is not found');
        return { user: mapToUserDto(user) };
    }

    @Put('follow/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async follow(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) followerId: number,
    ): Promise<void> {
        const follower = await this.usersService.getById(followerId);
        if (!follower) throw new NotFoundException('Follower with given id is not found');
        if (await this.followersService.hasFollower(user.id, follower.id))
            throw new BadRequestException(
                `User ${user.id} is already subscribed to user ${follower.id}`,
            );
        await this.followersService.follow(user.id, follower.id);
    }

    @Put('unfollow/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async unfollow(
        @User() user: UserWithToken,
        @Param('id', ParseIntPipe) followerId: number,
    ): Promise<void> {
        const follower = await this.usersService.getById(followerId);
        if (!user) throw new NotFoundException('Follower with given id is not found');
        if (!(await this.followersService.hasFollower(user.id, follower.id)))
            throw new BadRequestException(
                `User ${user.id} isn't subscribed to user ${follower.id}`,
            );
        await this.followersService.unfollow(user.id, follower.id);
    }
}
