import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignUpUserRequest {
    @IsNotEmpty()
    firstName: string;
    @IsNotEmpty()
    lastName: string;
    @IsEmail()
    email: string;
    @IsStrongPassword()
    password: string;
}
