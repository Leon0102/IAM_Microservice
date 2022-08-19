/* eslint-disable prettier/prettier */
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './domain/user.service';
import { UserController } from './application/user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserRepository } from './infrastructure/user.repository';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUsersHandler } from './application/query/get-all-users.handler';
import { GetOneUserHandler } from './application/query/get-one.handler';
import { CreateUserHandler } from './application/command/create-user.handler';
import { UpdateUserHandler } from './application/command/update-user.handler';
import { DeleteUserHandler } from './application/command/delete-user.handler';
import { MailerModule } from '@nestjs-modules/mailer';
import { ResetPasswordHandler } from './application/command/reset-password.handler';


export const UserRepoProvider: Provider = {
  provide: 'UserRepository',
  useClass: UserRepository
}

const application = [
  GetUsersHandler,
  GetOneUserHandler,
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  ResetPasswordHandler
]

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserRepository]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        auth: {
          user: 'apikey',
          pass: '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'
        }
      }
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'user-created',
          type: 'direct',
          options: {
            durable: true,
          },
        },
      ],
      // uri: 'amqp://guest:guest@rabbitmq:5672',
      uri: 'amqp://guest:guest@localhost:5672',
      enableControllerDiscovery: true,
    }),
    ClientsModule.register([{
      name: 'AUTH_CLIENT',
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 4000
      }
    },
    ],
    )
  ],
  providers: [UserService, UserRepoProvider, ...application],
  controllers: [UserController],
})
export class UserModule { }