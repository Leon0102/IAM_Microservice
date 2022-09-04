/* eslint-disable prettier/prettier */
import { ICommand } from '@nestjs/cqrs';

export class DeleteUserCommand implements ICommand {
    constructor(
        readonly id: string,
    ) { }
}