import { UserDto, mapToUserDto } from 'src/users/dto';
import { CommentWithUser } from '../types';
import { User } from '@prisma/client';

export class CommentDto {
    id: number;
    author: UserDto;
    description: string;
}

export function mapToCommentDto(comment: CommentWithUser): CommentDto {
    return {
        id: comment.id,
        author: mapToUserDto(comment.author as User),
        description: comment.description,
    };
}
