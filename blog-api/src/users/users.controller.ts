import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto, mapToUserDto } from './dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

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
}
