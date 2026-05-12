import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Scoring Engine (e2e)', () => {
  let app: INestApplication;

  const secret = 'test-secret';
  const candidateToken = sign({ sub: 1, role: 'candidate', candidateId: 1 }, secret);
  const otherCandidateToken = sign(
    { sub: 2, role: 'candidate', candidateId: 2 },
    secret,
  );
  const adminToken = sign({ sub: 99, role: 'admin' }, secret);

  beforeAll(async () => {
    process.env.JWT_SECRET = secret;
    process.env.DB_TYPE = 'sqljs';
    process.env.DB_DATABASE = 'test';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps score in pending state when only one component exists', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/scores')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ candidateId: 1, assessmentScore: 80 })
      .expect(201);

    expect(response.body.candidate_id).toBe(1);
    expect(response.body.assessment_score).toBe(80);
    expect(response.body.task_score).toBeNull();
    expect(response.body.status).toBe('pending');
    expect(response.body.composite_score).toBeNull();
    expect(response.body.tier).toBeNull();
    expect(response.body.score_breakdown).toBeNull();
    expect(response.body.scored_at).toBeNull();
  });

  it('calculates weighted score and assigns tier when both components exist', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/scores/1')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ taskScore: 70 })
      .expect(200);

    expect(response.body.assessment_score).toBe(80);
    expect(response.body.task_score).toBe(70);
    expect(response.body.composite_score).toBe(76);
    expect(response.body.tier).toBe('Job Ready');
    expect(response.body.status).toBe('completed');
    expect(response.body.score_breakdown.assessment_contribution).toBe(48);
    expect(response.body.score_breakdown.task_contribution).toBe(28);
    expect(response.body.scored_at).toBeTruthy();
  });

  it('recalculates score when a component is updated', async () => {
    const before = await request(app.getHttpServer())
      .get('/api/scores/1')
      .set('Authorization', `Bearer ${candidateToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch('/api/scores/1')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ taskScore: 50 })
      .expect(200);

    expect(response.body.composite_score).toBe(68);
    expect(response.body.tier).toBe('Emerging');
    expect(new Date(response.body.scored_at).getTime()).toBeGreaterThanOrEqual(
      new Date(before.body.scored_at).getTime(),
    );
  });

  it('rejects missing-score payload validation', async () => {
    await request(app.getHttpServer())
      .post('/api/scores')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ candidateId: 1 })
      .expect(400);
  });

  it('enforces access control for candidate ownership and auth', async () => {
    await request(app.getHttpServer()).get('/api/scores/1').expect(401);

    await request(app.getHttpServer())
      .get('/api/scores/1')
      .set('Authorization', `Bearer ${otherCandidateToken}`)
      .expect(403);

    const adminView = await request(app.getHttpServer())
      .get('/api/scores/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminView.body.candidate_id).toBe(1);
  });
});
