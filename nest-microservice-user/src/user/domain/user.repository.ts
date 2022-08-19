/* eslint-disable prettier/prettier */
import { User } from "./user.entity";

export interface IUserRepository {
    checkExistEmail(email: string): Promise<boolean>;
    getAll(): Promise<User[]>;
    findOneByEmail(email: string): Promise<User>;
    findOneByUserId(userId: string): Promise<User>;
    findOneByUsername(username: string): Promise<User>;
    createOne(entity: User): Promise<User>;
    updateOne(id: string, entity: User): Promise<any>;
    deleteOne(id: string): Promise<any>;
    softDeleteOne(id: string): Promise<any>;
}

