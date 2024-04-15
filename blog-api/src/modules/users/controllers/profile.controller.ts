// Common
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
    Body,
    BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
// Services
import { FilesService } from 'src/modules/files/services/files.service';
import { UsersService } from '../services/users.service';
// Types & Dtos
import { UserWith } from '../types';
import {
    UserDto,
    UpdateProfileRequest,
    mapToUserDto,
    GetProfileResponse,
    UpdateProfileResponse,
    ChangePasswordProfileResponse,
    ChangeAvatarProfileResponse,
    DeleteAvatarProfileResponse,
} from '../dto';
import { ChangePasswordProfileRequest } from '../dto/change-password-profile.request';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
    ) {}

    @Get()
    async get(@User() user: UserWith): Promise<GetProfileResponse> {
        return { user: mapToUserDto(user) };
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@User() user: UserWith): Promise<void> {
        await this.usersService.remove(user.id);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async update(
        @User() user: UserWith,
        @Body() request: UpdateProfileRequest,
    ): Promise<UpdateProfileResponse> {
        if (!request.firstName && !request.lastName)
            throw new BadRequestException('No data to update');
        if (request.firstName) user.firstName = request.firstName;
        if (request.lastName) user.lastName = request.lastName;
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }

    @Put('password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @User() user: UserWith,
        @Body() dto: ChangePasswordProfileRequest,
    ): Promise<ChangePasswordProfileResponse> {
        if (!(await argon2.verify(user.passwordHash, dto.password)))
            throw new BadRequestException('Invalid password');
        user.passwordHash = await argon2.hash(dto.newPassword);
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }

    @Put('avatar')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('avatar'))
    async changeAvatar(
        @User() user: UserWith,
        @UploadedFile() avatar: Express.Multer.File,
    ): Promise<ChangeAvatarProfileResponse> {
        user.avatar = await this.filesService.upload(avatar);
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }

    @Delete('avatar')
    @HttpCode(HttpStatus.OK)
    async deleteAvatar(@User() user: UserWith): Promise<DeleteAvatarProfileResponse> {
        await this.filesService.delete(user.avatar);
        user.avatar = null;
        user = await this.usersService.update(user);
        return { user: mapToUserDto(user) };
    }
}
