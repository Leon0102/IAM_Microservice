/* eslint-disable prettier/prettier */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 4000
    }
  })
  await app.startAllMicroservices();
  await app.listen(3000);
  Logger.log('Auth microservice running');
}
bootstrap();
