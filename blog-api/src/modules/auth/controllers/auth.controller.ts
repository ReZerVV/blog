// Common
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
import { Request, Response } from 'express';
import { Cookies } from '../decorators/cookies.decorator';
import { JwtAuthGuard } from '../guards';
// Services
import { AuthService } from '../services/auth.service';
// Types & Dtos
import { Token } from '@prisma/client';
import {
    RefreshUserResponse,
    SignInUserRequest,
    SignInUserResponse,
    SignUpUserRequest,
    SignUpUserResponse,
} from '../dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Create new account' })
    @ApiResponse({ status: 200, type: SignUpUserResponse })
    @Post('sign-up')
    @HttpCode(HttpStatus.OK)
    async signUp(
        @Res({ passthrough: true }) res: Response,
        @Body() request: SignUpUserRequest,
    ): Promise<SignUpUserResponse> {
        const { refreshToken, accessToken } = await this.authService.signUp(request);
        this.setTokenToCookies(res, refreshToken);
        return { accessToken };
    }

    @ApiResponse({ status: 200, type: SignInUserResponse })
    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Res({ passthrough: true }) res: Response,
        @Body() dto: SignInUserRequest,
    ): Promise<SignInUserResponse> {
        const { refreshToken, accessToken } = await this.authService.signIn(dto);
        this.setTokenToCookies(res, refreshToken);
        return { accessToken };
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Session termination' })
    @ApiResponse({ status: 204 })
    @Post('sign-out')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
        await this.authService.signOut(req.user);
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    }

    @ApiResponse({ status: 200, type: RefreshUserResponse })
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Cookies(REFRESH_TOKEN_COOKIE_NAME) token: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<RefreshUserResponse> {
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
