import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserDto {
    @ApiProperty({ example: 0, description: 'User id' })
    id: number;
    @ApiProperty({ example: '...', description: 'First name' })
    firstName: string;
    @ApiProperty({ example: '...', description: 'Last name' })
    lastName: string;
    @ApiProperty({ example: '...@mail.com', description: 'Email' })
    email: string;
    @ApiProperty({ example: 'avatar.png', description: 'Avatar' })
    avatar: string;
}

export function mapToUserDto(user: User): UserDto {
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
    };
}
