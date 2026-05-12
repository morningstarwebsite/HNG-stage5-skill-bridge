import { IsNumber, IsOptional, IsEnum, Max, Min } from 'class-validator';
import { TaskType } from '../scoring.enums';

export class UpdateScoreDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  assessmentScore?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taskScore?: number;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;
}
