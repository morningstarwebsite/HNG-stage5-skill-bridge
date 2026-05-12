import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScoreDto } from './dto/create-score.dto';
import { ScoreResponseDto } from './dto/score-response.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoreResult } from './score-result.entity';
import { ScoreCalculatorService } from './score-calculator.service';
import { ScoreStatus } from './scoring.enums';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(ScoreResult)
    private readonly scoreRepository: Repository<ScoreResult>,
    private readonly scoreCalculatorService: ScoreCalculatorService,
  ) {}

  async createOrUpdate(createScoreDto: CreateScoreDto): Promise<ScoreResponseDto> {
    this.ensureAtLeastOneComponentProvided(
      createScoreDto.assessmentScore,
      createScoreDto.taskScore,
    );

    const existing = await this.scoreRepository.findOne({
      where: { candidateId: createScoreDto.candidateId },
    });

    const mergedAssessment =
      createScoreDto.assessmentScore ?? existing?.assessmentScore ?? null;
    const mergedTask = createScoreDto.taskScore ?? existing?.taskScore ?? null;

    const entity = existing ?? this.scoreRepository.create({ candidateId: createScoreDto.candidateId });
    entity.assessmentScore = mergedAssessment;
    entity.taskScore = mergedTask;
    entity.taskType = createScoreDto.taskType ?? existing?.taskType ?? 'standard';

    this.applyScoreState(entity);

    const saved = await this.scoreRepository.save(entity);
    return this.toResponse(saved);
  }

  async patchByCandidateId(
    candidateId: number,
    updateScoreDto: UpdateScoreDto,
  ): Promise<ScoreResponseDto> {
    this.ensureAtLeastOneComponentProvided(
      updateScoreDto.assessmentScore,
      updateScoreDto.taskScore,
    );

    const existing = await this.scoreRepository.findOne({ where: { candidateId } });
    if (!existing) {
      throw new NotFoundException('Score record not found for candidate');
    }

    if (updateScoreDto.assessmentScore !== undefined) {
      existing.assessmentScore = updateScoreDto.assessmentScore;
    }
    if (updateScoreDto.taskScore !== undefined) {
      existing.taskScore = updateScoreDto.taskScore;
    }
    if (updateScoreDto.taskType !== undefined) {
      existing.taskType = updateScoreDto.taskType;
    }

    this.applyScoreState(existing);

    const saved = await this.scoreRepository.save(existing);
    return this.toResponse(saved);
  }

  async getByCandidateId(candidateId: number): Promise<ScoreResponseDto> {
    const score = await this.scoreRepository.findOne({ where: { candidateId } });
    if (!score) {
      throw new NotFoundException('Score record not found for candidate');
    }

    return this.toResponse(score);
  }

  private applyScoreState(entity: ScoreResult): void {
    if (entity.assessmentScore === null || entity.taskScore === null) {
      entity.status = ScoreStatus.Pending;
      entity.compositeScore = null;
      entity.tier = null;
      entity.scoreBreakdown = null;
      entity.scoredAt = null;
      return;
    }

    const computed = this.scoreCalculatorService.compute(
      Number(entity.assessmentScore),
      Number(entity.taskScore),
      entity.taskType,
    );

    entity.status = ScoreStatus.Completed;
    entity.compositeScore = computed.compositeScore;
    entity.tier = computed.tier;
    entity.scoreBreakdown = computed.scoreBreakdown;
    entity.calculationVersion = computed.calculationVersion;
    entity.scoredAt = new Date();
  }

  private ensureAtLeastOneComponentProvided(
    assessmentScore?: number,
    taskScore?: number,
  ): void {
    if (assessmentScore === undefined && taskScore === undefined) {
      throw new BadRequestException(
        'At least one score component (assessmentScore or taskScore) is required',
      );
    }
  }

  private toResponse(entity: ScoreResult): ScoreResponseDto {
    return {
      candidate_id: entity.candidateId,
      assessment_score: entity.assessmentScore === null ? null : Number(entity.assessmentScore),
      task_score: entity.taskScore === null ? null : Number(entity.taskScore),
      composite_score: entity.compositeScore === null ? null : Number(entity.compositeScore),
      tier: entity.tier,
      status: entity.status,
      score_breakdown: entity.scoreBreakdown,
      task_type: entity.taskType,
      calculation_version: entity.calculationVersion,
      scored_at: entity.scoredAt ? entity.scoredAt.toISOString() : null,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }
}
