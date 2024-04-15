import { IsNotEmpty } from 'class-validator';

export class UpdateCommentRequest {
    @IsNotEmpty()
    description: string;
}
