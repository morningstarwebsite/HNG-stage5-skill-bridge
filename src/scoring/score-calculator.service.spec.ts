import { ScoreCalculatorService } from './score-calculator.service';
import { ScoreTier } from './scoring.enums';

describe('ScoreCalculatorService', () => {
  const service = new ScoreCalculatorService();

  it('calculates weighted composite score with 60/40 split', () => {
    const result = service.compute(80, 70);

    expect(result.compositeScore).toBe(76);
    expect(result.scoreBreakdown.assessment_contribution).toBe(48);
    expect(result.scoreBreakdown.task_contribution).toBe(28);
  });

  it('assigns Not Ready tier for 0-49', () => {
    expect(service.compute(40, 40).tier).toBe(ScoreTier.NotReady);
    expect(service.compute(49, 49).tier).toBe(ScoreTier.NotReady);
  });

  it('assigns Emerging tier for 50-74', () => {
    expect(service.compute(50, 50).tier).toBe(ScoreTier.Emerging);
    expect(service.compute(74, 74).tier).toBe(ScoreTier.Emerging);
  });

  it('assigns Job Ready tier for 75-100', () => {
    expect(service.compute(75, 75).tier).toBe(ScoreTier.JobReady);
    expect(service.compute(100, 100).tier).toBe(ScoreTier.JobReady);
  });
});
