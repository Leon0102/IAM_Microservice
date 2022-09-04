/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;


    @IsNotEmpty()
    readonly username: string;

    @IsNotEmpty()
    readonly password: string;
}