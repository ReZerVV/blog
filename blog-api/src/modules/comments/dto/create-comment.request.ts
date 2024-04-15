import { IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateCommentRequest {
    @IsNotEmpty()
    postId: number;
    @IsNotEmpty()
    description: string;
}
