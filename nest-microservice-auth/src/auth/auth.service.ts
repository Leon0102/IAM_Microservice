/* eslint-disable prettier/prettier */
import { Injectable, Inject, Logger, RequestTimeoutException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as randtoken from 'rand-token';


@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_CLIENT')
    private readonly client: ClientProxy,
    private readonly jwtService: JwtService) { }

  async validateUser(email: string, password: string): Promise<any> {
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
      // console.log(user.password);
      if (!user) {
        return null;
      }
      // console.log(bcrypt.compareSync(password.toString(), user.password));
      if (await bcrypt.compareSync(password, user.password)) {
        // console.log('success');
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
      // console.log(user);
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
      secret: 'PhanTranHuyInformationTechnology'
    });
    // console.log(user.uuid);
    const refreshToken = await this.generateRefreshToken(user.uuid);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }

  validateToken(jwt: string) {
    const result = this.jwtService.verify(jwt);
    // console.log(result);
    return result;
  }

  async generateJwt(user: any): Promise<string> {
    const payload = {
      username: user.username,
      email: user.email,
      id: user.id,
    }
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = randtoken.generate(32);
    const expirydate = new Date();
    expirydate.setDate(expirydate.getDate() + 6);
    // await this.usersService.saveorupdateRefreshToken(refreshToken, userId, expirydate);
    const result = await this.client.send({ role: 'user', cmd: 'saveorupdateRefreshToken' }, { userId, refreshToken, expirydate })
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
    // console.log(result);
    return refreshToken
  }

  async refreshToken(user: any) {
    return {
      accessToken: await this.generateJwt(user),
      refreshToken: await this.generateRefreshToken(user.id)
    }
  }
}