import { ApiProperty } from '@nestjs/swagger';

export class RefreshUserResponse {
    @ApiProperty({ description: 'Access token for the ability to interact with secure endpoints' })
    accessToken: string;
}
