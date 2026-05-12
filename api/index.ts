import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import express from 'express';
import { AppModule } from '../src/app.module';

type ExpressHandler = (req: Request, res: Response) => void;

let cachedServer: ExpressHandler | null = null;

function getMissingRequiredEnvVars(): string[] {
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_PASSWORD', 'JWT_SECRET'];
  return requiredVars.filter((name) => !process.env[name] || process.env[name]?.trim() === '');
}

async function createServer(): Promise<ExpressHandler> {
  if (cachedServer) {
    return cachedServer;
  }

  const missingEnvVars = getMissingRequiredEnvVars();
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
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
  return cachedServer!;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    const server = await createServer();
    return server(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error('Vercel function bootstrap error:', message, error);

    res.status(500).json({
      error: 'Server initialization failed',
      message,
    });
  }
}
