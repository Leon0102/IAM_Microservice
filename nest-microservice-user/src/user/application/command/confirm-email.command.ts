/* eslint-disable prettier/prettier */
import { ICommand } from "@nestjs/cqrs";

export class ConfirmEmailCommand implements ICommand {
    constructor(
        readonly isEmailConfirmed: boolean,
        readonly token: string,
    ) {
    }
}