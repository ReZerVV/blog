import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './strategies';
import { UsersModule } from 'src/modules/users/users.module';
import { TokensService } from 'src/modules/auth/services/tokens.service';

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
    providers: [AuthService, TokensService, JwtAuthStrategy],
})
export class AuthModule {}
