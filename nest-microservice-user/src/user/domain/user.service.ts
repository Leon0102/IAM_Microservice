/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from '../infrastructure/user.repository';


@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneByEmail(email);
  }

  async getInfo(userId: string): Promise<any> {
    const user = await this.userRepository.findOneByUserId(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async saveorupdateRefreshToken(userId: string, refreshToken: string, refreshTokenExpires: Date): Promise<any> {
    // console.log(userId, refreshToken, refreshTokenExpires);
    const user = await this.userRepository.findOneByUserId(userId);
    // console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.updateRefreshToken(refreshToken, refreshTokenExpires);
    return await this.userRepository.updateOne(userId, user);
  }
}