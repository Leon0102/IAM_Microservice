/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./guard/local.strategy";
import { AuthController } from "./auth.controller";
import { JwtRefreshTokenStrategy } from "./guard/jwt.refreshtoken.strategy";
import { GoogleStrategy } from "./guard/google.strategy";
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [ClientsModule.register([{
    name: 'USER_CLIENT',
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4010,
    }
  }]), JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '3600s' }
  })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtRefreshTokenStrategy, GoogleStrategy]
})
export class AuthModule { }