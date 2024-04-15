import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserWith } from 'src/modules/users/types';
import { UsersService } from 'src/modules/users/services/users.service';

export type JwtPayload = {
    id: number;
    email: string;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly usersService: UsersService,
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('AUTH_JWT_SECRET'),
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload): Promise<UserWith> {
        const user: UserWith = await this.usersService.getById(payload.id);
        if (!user) throw new UnauthorizedException('Please log in to continue');
        return user;
    }
}
