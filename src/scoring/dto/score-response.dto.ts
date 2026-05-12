import { ScoreBreakdown, ScoreStatus, ScoreTier } from '../scoring.enums';

export interface ScoreResponseDto {
  candidate_id: number;
  assessment_score: number | null;
  task_score: number | null;
  composite_score: number | null;
  tier: ScoreTier | null;
  status: ScoreStatus;
  score_breakdown: ScoreBreakdown | null;
  task_type: string;
  calculation_version: string;
  scored_at: string | null;
  created_at: string;
  updated_at: string;
}