import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { SignUpUserDto } from './dto/sign-up-user.dto';
import { JwtAuthGuard } from './guards';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Token } from '@prisma/client';
import { Cookies } from './decorators/cookies.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async google() {}

    @Get('google/callback')
    @UseGuards(GoogleOAuthGuard)
    async googleCallback() {}

    @Post('sign-up')
    @HttpCode(HttpStatus.OK)
    async signUp(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: SignUpUserDto,
    ): Promise<{ accessToken: string }> {
        const { refreshToken, accessToken } = await this.authService.signUp(dto);
        this.setTokenToCookies(res, refreshToken);
        return { accessToken };
    }

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: SignInUserDto,
    ): Promise<{ accessToken: string }> {
        const { refreshToken, accessToken } = await this.authService.signIn(dto);
        this.setTokenToCookies(res, refreshToken);
        return { accessToken };
    }

    @Post('sign-out')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        await this.authService.signOut(req.user);
        res.clearCookie('refresh_token');
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Cookies('refresh_token') token: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ accessToken: string }> {
        const { refreshToken, accessToken } = await this.authService.refresh(token);
        this.setTokenToCookies(res, refreshToken);
        return { accessToken };
    }

    private setTokenToCookies(res: Response, token: Token) {
        res.cookie('refresh_token', token.token, {
            httpOnly: true,
            sameSite: true,
            expires: token.exp,
            secure: true,
        });
    }
}
