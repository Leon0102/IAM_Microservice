/* eslint-disable prettier/prettier */
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IUserRepository } from "src/user/domain/user.repository";
import { UserService } from "../user.service";
import { ResetPasswordCommand } from "./reset-password.command";

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: IUserRepository,
        private readonly userService: UserService,
    ) { }

    async execute(command: ResetPasswordCommand): Promise<void> {
        try {
            const result = await this.userService.findOneByToken(command.token);
            const currentUser = await this.userRepository.findOneByUserId(result.uuid);
            if (!currentUser) {
                throw new NotFoundException('User not found');
            }
            await currentUser.resetPassword();
            await this.userRepository.updateOne(currentUser.uuid, currentUser);
            Logger.log('resetPassword - Updated user');
        } catch (e) {
            Logger.log(e);
            throw e;
        }
    }
}