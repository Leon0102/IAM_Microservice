/* eslint-disable prettier/prettier */
import { IsNotEmpty } from "class-validator";

export class UpdateUserDTO {
    @IsNotEmpty()
    readonly username: string;

    @IsNotEmpty()
    readonly password: string;
}