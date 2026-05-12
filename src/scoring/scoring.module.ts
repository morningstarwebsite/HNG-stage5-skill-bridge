import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ScoreResult } from './score-result.entity';
import { ScoreCalculatorService } from './score-calculator.service';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreResult])],
  controllers: [ScoringController],
  providers: [ScoringService, ScoreCalculatorService, JwtAuthGuard, RolesGuard],
  exports: [ScoringService],
})
export class ScoringModule {}
