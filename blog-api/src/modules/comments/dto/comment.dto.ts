import { UserDto, mapToUserDto } from 'src/modules/users/dto';
import { CommentWith } from '../types';
import { User } from '@prisma/client';

export class CommentDto {
    id: number;
    author: UserDto;
    description: string;
}

export function mapToCommentDto(comment: CommentWith): CommentDto {
    return {
        id: comment.id,
        author: mapToUserDto(comment.author as User),
        description: comment.description,
    };
}
