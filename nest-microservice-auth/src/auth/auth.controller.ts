/* eslint-disable prettier/prettier */
import { Controller, Post, UseGuards, Request, Logger, Get, Req, HttpCode } from '@nestjs/common';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';
import { JwtRefreshTokenAuthGuard } from './guard/jwt-refreshtoken.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService) { }

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

  @MessagePattern({ role: 'auth', cmd: 'generateToken' })
  async generateToken(data) {
    try {
      const res = this.authService.generateJwt(data);
      return res;
    } catch (e) {
      Logger.log(e);
      return false;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenAuthGuard)
  async refreshToken(@Req() req: any) {
    // console.log(req.user);
    return this.authService.refreshToken(req.user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    return req.user;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req)
  }
}
