/* eslint-disable prettier/prettier */
import { EntityRepository, getRepository, Repository } from "typeorm";
import { User } from "../domain/user.entity";
import { IUserRepository } from "../domain/user.repository";

@EntityRepository(User)
export class UserRepository extends Repository<User> implements IUserRepository {
    async checkExistEmail(email: string): Promise<boolean> {
        const userExist = await this.findOneByEmail(email);
        return !!userExist;
    }

    async getAll(): Promise<User[]> {
        return await getRepository(User).createQueryBuilder('user')
            // .where('user.isEmailConfirmed = true')
            .getMany();
    }

    async findOneByEmail(email: string): Promise<User> {
        return getRepository(User).createQueryBuilder('user')
            .where('user.email = :email', { email })
            .getOne();
    }

    async findOneByUserId(userId: string): Promise<User> {
        return getRepository(User).findOne({ uuid: userId });
    }

    async findOneByUsername(username: string): Promise<User> {
        return getRepository(User).createQueryBuilder('user')
            .where('user.username = :username', { username })
            .getOne();
    }

    async createOne(entity: User): Promise<User> {
        return await getRepository(User).save(entity);
    }

    async updateOne(id: string, entity: User): Promise<any> {
        return await getRepository(User).update({ uuid: id }, entity);
        // return getRepository(User).save(entity);
    }

    async deleteOne(id: string): Promise<any> {
        return await getRepository(User).delete(id);
    }

    async softDeleteOne(id: string): Promise<any> {
        return await getRepository(User).softDelete(id);
    }
}