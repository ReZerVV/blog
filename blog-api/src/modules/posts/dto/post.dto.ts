import { UserDto, mapToUserDto } from 'src/modules/users/dto';
import { PostWith } from '../types';
import { UserWith } from 'src/modules/users/types';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
    @ApiProperty({ example: 0, description: 'Unique post number' })
    id: number;
    author: UserDto;
    @ApiProperty({ example: 'media.png', description: 'Poster for the post' })
    media: string;
    @ApiProperty({ example: '...', description: 'Post title' })
    title: string;
    @ApiProperty({ example: '...', description: 'Post description' })
    description: string;
    @ApiProperty({ example: 0, description: 'Number of likes' })
    likes: number;
    @ApiProperty({ example: 0, description: 'Number of views' })
    views: number;
    @ApiProperty({ example: false, description: 'Current user liked this post' })
    liked: boolean;
}

export function mapToPostDto(post: PostWith, user: UserWith = null): PostDto {
    return {
        id: post.id,
        author: mapToUserDto(post.author),
        media: post.media,
        title: post.title,
        description: post.description,
        likes: post.likes.length,
        views: post.veiws.length,
        liked: user ? post.likes.filter((like) => like.authorId == user.id).length != 0 : false,
    };
}
