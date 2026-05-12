import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import * as express from 'express';
import { AppModule } from '../src/app.module';

type ExpressHandler = (req: Request, res: Response) => void;

let cachedServer: ExpressHandler | null = null;

async function createServer(): Promise<ExpressHandler> {
  if (cachedServer) {
    return cachedServer;
  }

  const logger = new Logger('VercelBootstrap');
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  logger.log('Nest application initialized for Vercel serverless runtime');

  cachedServer = server;
  return cachedServer;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  const server = await createServer();
  return server(req, res);
}
