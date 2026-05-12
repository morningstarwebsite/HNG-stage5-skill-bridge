import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskTypeAndCalculationVersion1715462400001 implements MigrationInterface {
  name = 'AddTaskTypeAndCalculationVersion1715462400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE score_results
      ADD COLUMN task_type VARCHAR(20) NOT NULL DEFAULT 'standard'
    `);

    await queryRunner.query(`
      ALTER TABLE score_results
      ADD COLUMN calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_score_results_task_type
      ON score_results(task_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_score_results_task_type`);
    await queryRunner.query(`ALTER TABLE score_results DROP COLUMN calculation_version`);
    await queryRunner.query(`ALTER TABLE score_results DROP COLUMN task_type`);
  }
}
