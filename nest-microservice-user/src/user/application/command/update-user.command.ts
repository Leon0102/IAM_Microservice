/* eslint-disable prettier/prettier */
import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
    constructor(
        readonly id: string,
        readonly username: string,
        readonly password: string,
    ) { }
}