import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ScoreBreakdown, ScoreStatus, ScoreTier } from './scoring.enums';

@Entity({ name: 'score_results' })
@Index(['candidateId'], { unique: true })
export class ScoreResult {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'candidate_id', type: 'int' })
  candidateId!: number;

  @Column({ name: 'assessment_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  assessmentScore!: number | null;

  @Column({ name: 'task_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taskScore!: number | null;

  @Column({ name: 'composite_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  compositeScore!: number | null;

  @Column({
    name: 'tier',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  tier!: ScoreTier | null;

  @Column({
    name: 'task_type',
    type: 'varchar',
    length: 20,
    default: 'standard',
  })
  taskType!: string;

  @Column({
    name: 'calculation_version',
    type: 'varchar',
    length: 20,
    default: 'v1.0',
  })
  calculationVersion!: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: ScoreStatus.Pending,
  })
  status!: ScoreStatus;

  @Column({ name: 'score_breakdown', type: 'simple-json', nullable: true })
  scoreBreakdown!: ScoreBreakdown | null;

  @Column({ name: 'scored_at', type: 'timestamp', nullable: true })
  scoredAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
