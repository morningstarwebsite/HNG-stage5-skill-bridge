export enum ScoreStatus {
  Pending = 'pending',
  Completed = 'completed',
}

export enum ScoreTier {
  NotReady = 'Not Ready',
  Emerging = 'Emerging',
  JobReady = 'Job Ready',
}

export enum TaskType {
  Frontend = 'frontend',
  Backend = 'backend',
  FullStack = 'fullstack',
  QA = 'qa',
  Design = 'design',
  Standard = 'standard', // default
}

export interface ScoreBreakdown {
  assessment_weight: number;
  task_weight: number;
  assessment_contribution: number;
  task_contribution: number;
  formula: string;
  calculation_version: string;
  task_type: string;
}
