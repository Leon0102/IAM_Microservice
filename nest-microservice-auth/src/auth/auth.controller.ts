/* eslint-disable prettier/prettier */
import { Controller, Post, UseGuards, Request, Logger, Get, Req, HttpCode } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { async } from 'rxjs';
import { JwtRefreshTokenAuthGuard } from './jwt-refreshtoken.guard';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @MessagePattern({ role: 'auth', cmd: 'check' })
  async loggedIn(data) {
    try {
      const res = this.authService.validateToken(data.jwt);
      return res;
    } catch (e) {
      Logger.log(e);
      return false;
    }
  }
  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async refreshToken(@Req() req: any) {
    // console.log(req.user);
    return this.authService.refreshToken(req.user);
  }
}
