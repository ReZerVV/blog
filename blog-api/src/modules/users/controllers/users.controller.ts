// Common
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
// Services
import { UsersService } from '../services/users.service';
// Types & Dtos
import { GetAllUserResponse, GetByIdUserResponse, mapToUserDto } from '../dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiResponse({ status: 200, type: GetAllUserResponse })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(@Query('email') email: string): Promise<GetAllUserResponse> {
        const users = await this.usersService.getAll(email);
        return { users: users.map((user) => mapToUserDto(user)) };
    }

    @ApiResponse({ status: 200, type: GetByIdUserResponse })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getById(@Param('id', ParseIntPipe) userId: number): Promise<GetByIdUserResponse> {
        const user = await this.usersService.getById(userId);
        if (!user) throw new NotFoundException('User with given id is not found');
        return { user: mapToUserDto(user) };
    }
}
