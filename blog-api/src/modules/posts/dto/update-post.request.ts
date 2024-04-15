import { IsOptional } from 'class-validator';

export class UpdatePostRequest {
    @IsOptional()
    media?: Express.Multer.File;
    @IsOptional()
    title?: string;
    @IsOptional()
    description?: string;
}
