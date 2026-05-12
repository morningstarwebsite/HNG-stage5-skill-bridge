import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ScoreResult } from '../scoring/score-result.entity';
import { CreateScoreResultsTable1715462400000 } from './migrations/1715462400000-CreateScoreResultsTable';
import { AddTaskTypeAndCalculationVersion1715462400001 } from './migrations/1715462400001-AddTaskTypeAndCalculationVersion';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? process.env.DB_NAME ?? 'skillbridge',
  entities: [ScoreResult],
  migrations: [CreateScoreResultsTable1715462400000, AddTaskTypeAndCalculationVersion1715462400001],
  synchronize: false,
});