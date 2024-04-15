import { ApiProperty } from '@nestjs/swagger';

export class SignInUserResponse {
    @ApiProperty({ description: 'Access token for the ability to interact with secure endpoints' })
    accessToken: string;
}
