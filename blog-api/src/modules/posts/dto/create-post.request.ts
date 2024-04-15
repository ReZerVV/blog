import { IsNotEmpty } from 'class-validator';

export class CreatePostRequest {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
}
