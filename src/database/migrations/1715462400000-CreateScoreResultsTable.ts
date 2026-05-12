import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScoreResultsTable1715462400000 implements MigrationInterface {
  name = 'CreateScoreResultsTable1715462400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS score_results (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER NOT NULL UNIQUE,
        assessment_score NUMERIC(5,2),
        task_score NUMERIC(5,2),
        composite_score NUMERIC(5,2),
        tier VARCHAR(20),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        score_breakdown TEXT,
        scored_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_score_results_candidate_id
      ON score_results(candidate_id)
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_score_results_updated_at ON score_results
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_score_results_updated_at
      BEFORE UPDATE ON score_results
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_score_results_updated_at ON score_results`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_score_results_candidate_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS score_results`);
  }
}