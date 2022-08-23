/* eslint-disable prettier/prettier */

import { BadRequestException, Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "src/user/domain/user.repository";
import { UserService } from "../user.service";
import { ConfirmEmailCommand } from "./confirm-email.command";

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        @Inject('UserRepository') private readonly userRepository: IUserRepository,
        private readonly userService: UserService,
    ) { }

    async execute(command: ConfirmEmailCommand): Promise<any> {
        const result = await this.userService.findOneByToken(command.token);
        if (!result) {
            throw new BadRequestException('Invalid token');
        }
        const user = await this.userRepository.findOneByUserId(result.uuid);
        user.confirmEmail();
        await this.userRepository.updateOne(user.uuid, user);
    }
}