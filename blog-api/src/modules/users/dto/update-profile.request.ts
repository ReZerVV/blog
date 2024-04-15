import { IsOptional } from 'class-validator';

export class UpdateProfileRequest {
    @IsOptional()
    firstName?: string;
    @IsOptional()
    lastName?: string;
}
