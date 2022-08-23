/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, Unique, Generated, UpdateDateColumn, DeleteDateColumn, BeforeUpdate, VersionColumn } from 'typeorm';
import { hash } from 'bcrypt';
import { IsEmail, Min } from 'class-validator';
import { UserInterface } from './user.interface';
import { Exclude } from 'class-transformer';
import { AggregateRoot } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

@Entity()
@Unique(['email'])
export class User extends AggregateRoot implements UserInterface {

  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  @Min(4)
  @Exclude()
  password: string;

  @Column()
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ nullable: true })
  @Exclude()
  refreshtokenexpires: Date;

  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  @VersionColumn()
  @Exclude()
  version = 0;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await hash(this.password, 10);
    }
  }

  // @BeforeUpdate()
  // async hashPasswordUpdate() {
  //   this.password = bcrypt.hashSync(this.password, 10);
  // }

  @BeforeUpdate()
  updateVersion() {
    this.version++;
  }

  constructor(username: string, password: string, email: string) {
    super();
    this.username = username;
    this.password = password;
    this.email = email;
  }

  confirmEmail() {
    this.isEmailConfirmed = true;
  }

  async updateUser(username: string, password: string) {
    this.username = username;
    this.password = await hash(password, 10);
  }

  async updateRefreshToken(refreshToken: string, refreshTokenExpires: Date) {
    this.refreshToken = refreshToken;
    this.refreshtokenexpires = refreshTokenExpires;
  }

  async resetPassword() {
    this.password = await hash('123456', 10);
  }
}