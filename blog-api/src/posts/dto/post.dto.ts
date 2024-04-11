import { UserDto, mapToUserDto } from 'src/users/dto';
import { PostWithLikes } from '../types';
import { UserWithToken } from 'src/users/types';

export class PostDto {
    id: number;
    author: UserDto;
    media: string;
    title: string;
    description: string;
    likes: number;
    liked: boolean;
}

export function mapToPostDto(post: PostWithLikes, user: UserWithToken = null): PostDto {
    return {
        id: post.id,
        author: mapToUserDto(post.author),
        media: post.media,
        title: post.title,
        description: post.description,
        likes: post.likes.length,
        liked: user ? post.likes.filter((like) => like.authorId == user.id).length != 0 : false,
    };
}
