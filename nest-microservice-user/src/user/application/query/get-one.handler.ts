/* eslint-disable prettier/prettier */

import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { User } from "src/user/domain/user.entity";
import { IUserRepository } from "src/user/domain/user.repository";
import { GetOneUserQuery } from "./get-one.query";

@QueryHandler(GetOneUserQuery)
export class GetOneUserHandler implements IQueryHandler<GetOneUserQuery> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: IUserRepository,
    ) { }
    async execute(query: GetOneUserQuery): Promise<User> {
        return this.userRepository.findOneByUserId(query.id);
    }
}