/* eslint-disable prettier/prettier */
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "src/user/domain/user.repository";
import { UpdateUserCommand } from "./update-user.command";


@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: IUserRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: UpdateUserCommand): Promise<void> {
        try {
            const currentUser = await this.userRepository.findOneByUserId(command.id);
            if (!currentUser) {
                throw new NotFoundException('User not found');
            }
            await currentUser.updateUser(command.username, command.password);
            this.amqpConnection.publish('test', 'UserUpdatedIntergrationEvent', { Id: command.id, UserName: command.username }, { persistent: true });
            await this.userRepository.updateOne(command.id, currentUser);
            Logger.log('updateUser - Updated user');
        } catch (e) {
            Logger.log(e);
            throw e;
        }
    }
}