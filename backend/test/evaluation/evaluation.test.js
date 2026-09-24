const request = require('supertest');
const app = require('../../src/app');

describe('Evaluation Engine (Member 7)', () => {
  it('should return 400 if identifier is missing', async () => {
    const response = await request(app)
      .post('/api/v1/evaluate')
      .set('x-test-environment-id', '676a1b2c3d4e5f6a7b8c9d0e')
      .send({ traits: { plan: 'premium' } });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should successfully evaluate flags for a valid identity', async () => {
    const response = await request(app)
      .post('/api/v1/evaluate')
      .set('x-test-environment-id', '676a1b2c3d4e5f6a7b8c9d0e')
      .send({
        identifier: 'user_123',
        traits: { plan: 'premium' }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.flags).toBeDefined();
  });
});