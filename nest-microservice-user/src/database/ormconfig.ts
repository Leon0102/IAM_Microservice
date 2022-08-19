/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
    // type: 'postgres',
    // host: 'db',
    // port: 5432,
    // username: 'postgres',
    // password: 'postgres',
    // database: 'postgres',
    // autoLoadEntities: true,
    // synchronize: true,
    // logging: true,
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
};
