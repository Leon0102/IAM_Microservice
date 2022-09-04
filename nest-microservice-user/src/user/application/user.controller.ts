/* eslint-disable prettier/prettier */
import { Controller, UseGuards, Get, Post, Body, Patch, Param, Req, Delete, NotFoundException, UseInterceptors, ClassSerializerInterceptor, Query, Res, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from '../domain/user.entity';
import { AuthGuard } from '../../guards/AuthGuard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersQuery } from './query/get-all-users.query';
import { GetOneUserQuery } from './query/get-one.query';
import { CreateUserCommand } from './command/create-user.command';
import { UpdateUserCommand } from './command/update-user.command';
import { DeleteUserCommand } from './command/delete-user.command';
import { ResetPasswordCommand } from './command/reset-password.command';
import { CreateUserDto } from '../domain/dto/create-user.dto';
import { UpdateUserDTO } from '../domain/dto/update-user.dto';
import { ConfirmEmailCommand } from './command/confirm-email.command';

@Controller('/users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) { }

    @MessagePattern({ role: 'user', cmd: 'get' })
    getUser(data: any): Promise<User> {
        return this.userService.findOneByEmail(data.email);
    }

    @MessagePattern({ role: 'user', cmd: 'saveorupdateRefreshToken' })
    async saveOrUpdateRefreshToken(data: any): Promise<any> {
        return this.userService.saveOrUpdateRefreshToken(data.userId, data.refreshToken, data.expirydate);
    }

    @MessagePattern({ role: 'user', cmd: 'createWithGoogle' })
    async createWithGoogle(data: any): Promise<any> {
        console.log(data);
        return this.commandBus.execute(new CreateUserCommand(data.username, data.email, data.password));
    }


    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('')
    async getUsers(): Promise<User[]> {
        return this.queryBus.execute(new GetUsersQuery());
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async getInfo(@Req() req: any): Promise<any> {
        return this.queryBus.execute(new GetOneUserQuery(req.headers['user-id']));
    }

    @Post('create')
    async createUser(@Body() user: CreateUserDto): Promise<void> {
        return this.commandBus.execute(new CreateUserCommand(user.username, user.email, user.password));
    }

    @Get('confirm-email')
    async confirmEmail(@Res() res, @Query('token') token: string): Promise<any> {
        await this.commandBus.execute(new ConfirmEmailCommand(true, token));
        return res.redirect('/');
    }

    @UseGuards(AuthGuard)
    @Patch('/:id')
    async updateUser(@Param('id') id: string, @Body() user: UpdateUserDTO): Promise<void> {
        return this.commandBus.execute(new UpdateUserCommand(id, user.username, user.password));
    }

    @UseGuards(AuthGuard)
    @Delete('/:id')
    async deleteUser(@Param('id') id: string): Promise<void> {
        return this.commandBus.execute(new DeleteUserCommand(id));
    }

    @Get('reset-password')
    async resetPassword(@Res() res, @Query('token') token: string): Promise<void> {
        await this.commandBus.execute(new ResetPasswordCommand(token));
        return res.redirect('/');

    }

    @UseGuards(AuthGuard)
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string): Promise<void> {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('User does not exist!');
        }
        return this.userService.sendMail(email, user.uuid);
    }

    // @RabbitSubscribe({
    //   exchange: 'abc',
    //   routingKey: 'logs',
    //   queue: 'abc',
    //   queueOptions: {
    //     durable: true,
    //   },
    // })
    // async test(data: any): Promise<any> {
    //   // Logger.log(data);
    //   return data;
    // }
    // @MessagePattern('TestIntegrationEvent')
    // async test(data: any): Promise<any> {
    //   // Logger.log(data);
    //   Logger.log(data);
    // }
}