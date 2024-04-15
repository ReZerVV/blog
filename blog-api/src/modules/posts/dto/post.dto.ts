import { UserDto, mapToUserDto } from 'src/modules/users/dto';
import { PostWith } from '../types';
import { UserWith } from 'src/modules/users/types';

export class PostDto {
    id: number;
    author: UserDto;
    media: string;
    title: string;
    description: string;
    likes: number;
    views: number;
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
