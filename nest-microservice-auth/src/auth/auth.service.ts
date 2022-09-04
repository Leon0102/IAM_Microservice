/* eslint-disable prettier/prettier */
import { Injectable, Inject, Logger, RequestTimeoutException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as randtoken from 'rand-token';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_CLIENT')
    private readonly client: ClientProxy,
    private readonly jwtService: JwtService) { }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.getUserByMail(email);
      if (!user) {
        return null;
      }
      if (user.password === null) {
        throw new BadRequestException('User has no password');
      }
      if (await bcrypt.compareSync(password, user.password)) {
        return user;
      }
      return null;
    } catch (e) {
      Logger.log(e);
      throw e;
    }
  }

  async getUserByMail(email: string) {
    try {
      const user = await this.client.send({ role: 'user', cmd: 'get' }, { email })
        .pipe(
          timeout(5000),
          catchError((err: Error) => {
            if (err instanceof TimeoutError) {
              return throwError(new RequestTimeoutException());
            }
            return throwError(err);
          }
          )
        ).toPromise();
      if (!user) {
        return null;
      }
      return user;
    } catch (e) {
      Logger.log(e);
      throw e;
    }
  }

  async login(user) {
    const payload = {
      username: user.username,
      email: user.email,
      id: user.uuid,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET
    });
    const refreshToken = await this.generateRefreshToken(user.uuid);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  validateToken(jwt: string) {
    const result = this.jwtService.verify(jwt);
    return result;
  }

  async generateJwt(user: any): Promise<string> {
    const payload = {
      username: user.username,
      email: user.email,
      id: user.id,
    }
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = randtoken.generate(32);
    const expirydate = new Date();
    expirydate.setDate(expirydate.getDate() + 6);
    await this.client.send({ role: 'user', cmd: 'saveorupdateRefreshToken' }, { userId, refreshToken, expirydate })
      .pipe(
        timeout(5000),
        catchError((err: Error) => {
          if (err instanceof TimeoutError) {
            return throwError(new RequestTimeoutException());
          }
          return throwError(err);
        }
        )
      ).toPromise();
    return refreshToken
  }

  async refreshToken(user: any) {
    return {
      accessToken: await this.generateJwt(user),
      refreshToken: await this.generateRefreshToken(user.id)
    }
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google'
    }
    const checkUser = await this.getUserByMail(req.user.email);
    if (checkUser) {
      return this.login(checkUser);
    } else {
      try {
        const user = await this.client.send({ role: 'user', cmd: 'createWithGoogle' }, { email: req.user.email, username: req.user.firstName, password: null })
          .pipe(
            timeout(5000),
            catchError((err: Error) => {
              if (err instanceof TimeoutError) {
                return throwError(new RequestTimeoutException());
              }
              return throwError(err);
            }
            )
          ).toPromise();
        return this.login(user);
      }
      catch (e) {
        Logger.log(e);
      }
    }
  }
}