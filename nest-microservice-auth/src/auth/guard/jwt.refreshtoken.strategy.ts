/* eslint-disable prettier/prettier */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AuthService } from '../auth.service';
dotenv.config();

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refreshtoken") {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('accessToken'),
            ignoreExpiration: true,
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: true
        });
    }

    async validate(req: any, payload: any) {
        // console.log(payload);
        const user = await this.authService.getUserByMail(payload.email);
        // console.log(user);
        if (!user) {
            throw new UnauthorizedException();
        }
        if (user.refreshToken !== req.body.refreshToken) {
            throw new UnauthorizedException();
        }
        if (new Date() > new Date(user.refreshtokenexpires)) {
            throw new UnauthorizedException();
        }
        return { id: user.uuid, username: user.username, email: user.email, };
    }
}