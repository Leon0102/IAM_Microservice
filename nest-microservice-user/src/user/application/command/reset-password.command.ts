/* eslint-disable prettier/prettier */
import { ICommand } from '@nestjs/cqrs';

export class ResetPasswordCommand implements ICommand {
    constructor(
        readonly id: string,
    ) { }
}