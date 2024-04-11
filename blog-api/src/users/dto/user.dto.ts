import { User } from '@prisma/client';

export class UserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    followed: boolean;
}

export function mapToUserDto(user: User, curUser: User = null): UserDto {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        followed: false,
    };
}
