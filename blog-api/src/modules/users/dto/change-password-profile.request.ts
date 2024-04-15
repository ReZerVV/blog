import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordProfileRequest {
    @IsStrongPassword()
    password: string;
    @IsNotEmpty()
    newPassword: string;
}
