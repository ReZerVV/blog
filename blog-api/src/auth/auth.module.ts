import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy, GoogleOAuthStrategy } from './strategies';
import { UsersModule } from 'src/users/users.module';
import { TokensService } from 'src/users/tokens/tokens.service';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('AUTH_JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('AUTH_JWT_ACCESS_EXP'),
                    audience: configService.get<string>('AUTH_JWT_AUDIENCE'),
                    issuer: configService.get<string>('AUTH_JWT_ISSUER'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleOAuthStrategy, JwtAuthStrategy],
})
export class AuthModule {}
