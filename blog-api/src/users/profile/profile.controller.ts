import {
    Get,
    HttpCode,
    HttpStatus,
    Put,
    Delete,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    Controller,
} from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { UsersService } from '../users.service';
import { UserWithToken } from '../types';
import { UserDto, mapToUserDto } from '../dto';

@Controller('profile')
export class ProfileController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getProfile(@User() user: UserWithToken): Promise<{ user: UserDto }> {
        return { user: mapToUserDto(user) };
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async removeProfile(@User() user: UserWithToken): Promise<void> {
        await this.usersService.remove(user.id);
    }

    @Put('avatar')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    async removeAvatar(@User() user: UserWithToken): Promise<{ user: UserDto }> {
        await this.filesService.remove(user.avatar);
        user.avatar = null;
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }
}
