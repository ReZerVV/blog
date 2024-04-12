import { User } from '@prisma/client';

export class UserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
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
