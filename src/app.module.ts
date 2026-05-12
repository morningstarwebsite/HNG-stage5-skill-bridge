import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringModule } from './scoring/scoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'postgres');
        const synchronize = config.get<string>('TYPEORM_SYNC', 'false') === 'true';
        const migrationsRun = config.get<string>('TYPEORM_MIGRATIONS_RUN', 'false') === 'true';
        const sslEnabled = config.get<string>('DB_SSL', 'false') === 'true';

        if (dbType === 'sqljs') {
          return {
            type: 'sqljs' as const,
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        const dbUrl = config.get<string>('DB_URL');

        if (dbUrl) {
          return {
            type: 'postgres' as const,
            url: dbUrl,
            autoLoadEntities: true,
            migrations: ['dist/database/migrations/*.js'],
            migrationsRun,
            synchronize,
            ssl: sslEnabled || dbUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get<string>('DB_PORT', '5432')),
          username: config.get<string>('DB_USERNAME') ?? config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_DATABASE') ?? config.get<string>('DB_NAME', 'skillbridge'),
          autoLoadEntities: true,
          migrations: ['dist/database/migrations/*.js'],
          migrationsRun,
          synchronize,
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    ScoringModule,
  ],
})
export class AppModule {}
