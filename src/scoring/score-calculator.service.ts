import { Injectable } from '@nestjs/common';
import { ScoreBreakdown, ScoreTier, TaskType } from './scoring.enums';

interface ScoreComputation {
  compositeScore: number;
  tier: ScoreTier;
  scoreBreakdown: ScoreBreakdown;
  calculationVersion: string;
}

interface WeightConfig {
  assessmentWeight: number;
  taskWeight: number;
  version: string;
}

@Injectable()
export class ScoreCalculatorService {
  private readonly weights: Record<string, WeightConfig> = {
    [TaskType.Frontend]: {
      assessmentWeight: 0.4,
      taskWeight: 0.6,
      version: 'v1.1-frontend',
    },
    [TaskType.Backend]: {
      assessmentWeight: 0.6,
      taskWeight: 0.4,
      version: 'v1.0-backend',
    },
    [TaskType.FullStack]: {
      assessmentWeight: 0.5,
      taskWeight: 0.5,
      version: 'v1.0-fullstack',
    },
    [TaskType.QA]: {
      assessmentWeight: 0.55,
      taskWeight: 0.45,
      version: 'v1.0-qa',
    },
    [TaskType.Design]: {
      assessmentWeight: 0.4,
      taskWeight: 0.6,
      version: 'v1.0-design',
    },
    [TaskType.Standard]: {
      assessmentWeight: 0.6,
      taskWeight: 0.4,
      version: 'v1.0-standard',
    },
  };

  compute(assessmentScore: number, taskScore: number, taskType: string = TaskType.Standard): ScoreComputation {
    const config = this.weights[taskType] || this.weights[TaskType.Standard];
    const assessmentContribution = this.round(assessmentScore * config.assessmentWeight);
    const taskContribution = this.round(taskScore * config.taskWeight);
    const compositeScore = this.round(assessmentContribution + taskContribution);

    return {
      compositeScore,
      tier: this.resolveTier(compositeScore),
      scoreBreakdown: {
        assessment_weight: config.assessmentWeight,
        task_weight: config.taskWeight,
        assessment_contribution: assessmentContribution,
        task_contribution: taskContribution,
        formula: `(${assessmentScore} * ${config.assessmentWeight}) + (${taskScore} * ${config.taskWeight}) = ${compositeScore}`,
        calculation_version: config.version,
        task_type: taskType,
      },
      calculationVersion: config.version,
    };
  }

  private resolveTier(compositeScore: number): ScoreTier {
    if (compositeScore <= 49) {
      return ScoreTier.NotReady;
    }
    if (compositeScore <= 74) {
      return ScoreTier.Emerging;
    }
    return ScoreTier.JobReady;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
