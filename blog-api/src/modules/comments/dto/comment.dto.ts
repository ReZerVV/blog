import { UserDto, mapToUserDto } from 'src/modules/users/dto';
import { CommentWith } from '../types';
import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
    @ApiProperty({ example: 0, description: 'Unique comment number' })
    id: number;
    author: UserDto;
    @ApiProperty({ example: '...', description: 'Comment text' })
    description: string;
}

export function mapToCommentDto(comment: CommentWith): CommentDto {
    return {
        id: comment.id,
        author: mapToUserDto(comment.author as User),
        description: comment.description,
    };
}
