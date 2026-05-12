import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoringService } from './scoring.service';

@Controller('scores')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post()
  createOrUpdate(@Body() body: CreateScoreDto) {
    return this.scoringService.createOrUpdate(body);
  }

  @Patch(':candidateId')
  patchByCandidateId(
    @Param('candidateId', ParseIntPipe) candidateId: number,
    @Body() body: UpdateScoreDto,
  ) {
    return this.scoringService.patchByCandidateId(candidateId, body);
  }

  @Get('me/result')
  getForCurrentCandidate() {
    return {
      message: 'SkillBridge score engine and tier is live',
      status: 'ok',
      note: 'Authentication is currently disabled for this MVP deployment.',
    };
  }

  @Get(':candidateId')
  getByCandidateId(@Param('candidateId', ParseIntPipe) candidateId: number) {
    return this.scoringService.getByCandidateId(candidateId);
  }
}
