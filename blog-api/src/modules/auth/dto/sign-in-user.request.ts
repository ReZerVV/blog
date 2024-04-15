import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignInUserRequest {
    @IsEmail()
    email: string;
    password: string;
}
