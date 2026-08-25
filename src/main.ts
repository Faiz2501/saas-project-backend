import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import 'dotenv/config' 
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (
    process.env.CORS_ORIGINS ??
    'http://localhost:3001,http://localhost:5173,http://localhost:3000,https://hankie-paralegal-apple.ngrok-free.dev,https://bernadette-longitudinal-sheila.ngrok-free.dev'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();