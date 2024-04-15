// Common
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
// Services
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/services/users.service';
import { TokensService } from 'src/modules/auth/services/tokens.service';
// Types & Dtos
import { Tokens } from '../types';
import { SignInUserRequest, SignUpUserRequest } from '../dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService,
        private readonly configService: ConfigService,
    ) {}

    private async generateJwtTokens(
        payload,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.sign(payload, {
                expiresIn: this.configService.get<string>('AUTH_JWT_ACCESS_EXP'),
            }),
            this.jwtService.sign(payload, {
                expiresIn: this.configService.get<string>('AUTH_JWT_REFRESH_EXP'),
            }),
        ]);
        return { accessToken, refreshToken };
    }

    async signUp(dto: SignUpUserRequest): Promise<Tokens> {
        if (await this.usersService.getByEmail(dto.email))
            throw new BadRequestException('User with given email is already exists');

        const user = await this.usersService.create(
            dto.email,
            dto.firstName,
            dto.lastName,
            await argon2.hash(dto.password),
        );

        const { accessToken, refreshToken: refreshTokenValue } = await this.generateJwtTokens({
            id: user.id,
            email: user.email,
        });

        const refreshToken = await this.tokensService.create(
            user.id,
            refreshTokenValue,
            new Date(Date.now() + 5 * 60 * 1000),
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    async signIn(dto: SignInUserRequest): Promise<Tokens> {
        const user = await this.usersService.getByEmail(dto.email);

        if (!user) throw new BadRequestException('User with given email is not found');
        if (!(await argon2.verify(user.passwordHash, dto.password)))
            throw new BadRequestException('Invalid password');

        const { accessToken, refreshToken: refreshTokenValue } = await this.generateJwtTokens({
            id: user.id,
            email: user.email,
        });

        let refreshToken;
        if (user.token) {
            refreshToken = await this.tokensService.update(
                user.id,
                refreshTokenValue,
                new Date(Date.now() + 5 * 60 * 1000),
            );
        } else {
            refreshToken = await this.tokensService.create(
                user.id,
                refreshTokenValue,
                new Date(Date.now() + 5 * 60 * 1000),
            );
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    async signOut(user) {
        await this.tokensService.remove(user.id);
    }

    async refresh(tokenValue: string | null): Promise<Tokens> {
        if (!tokenValue) throw new UnauthorizedException();
        const token = await this.tokensService.getByToken(tokenValue);
        if (!token || token.token != tokenValue) throw new UnauthorizedException();
        if (token.exp <= new Date(Date.now())) throw new UnauthorizedException();
        const user = token.user;

        const { accessToken, refreshToken: refreshTokenValue } = await this.generateJwtTokens({
            id: user.id,
            email: user.email,
        });

        const refreshToken = await this.tokensService.update(
            user.id,
            refreshTokenValue,
            new Date(Date.now() + 5 * 60 * 1000),
        );

        return {
            accessToken,
            refreshToken,
        };
    }
}
