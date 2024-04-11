import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserDto, mapToUserDto } from '../dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users.service';
import { User } from 'src/auth/decorators/user.decorator';
import { UserWithToken } from '../types';
import { FilesService } from 'src/files/files.service';

@Controller('users/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async profile(@User() user: UserWithToken): Promise<{ user: UserDto }> {
        return { user: mapToUserDto(user) };
    }

    @Put('avatar')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('avatar'))
    async changeAvatar(
        @User() user: UserWithToken,
        @UploadedFile() avatar: Express.Multer.File,
    ): Promise<{ user: UserDto }> {
        user.avatar = await this.filesService.upload(avatar);
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }

    @Delete('avatar')
    @HttpCode(HttpStatus.OK)
    async removeAvatar(@User() user: UserWithToken): Promise<{ user: UserDto }> {
        user.avatar = null;
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }
}
