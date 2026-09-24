const request = require('supertest');
const app = require('../../src/app');

describe('Targeting Rules', () => {
  it('should return true when user traits match targeting rules', async () => {
    const response = await request(app)
      .post('/api/v1/evaluate')
      .set('x-test-environment-id', '676a1b2c3d4e5f6a7b8c9d0e')
      .send({
        identifier: 'user_123',
        traits: { plan: 'premium' }
      });

    expect(response.status).toBe(200);
    expect(response.body.flags.premium_feature).toBe(true);
  });

  it('should return false when user traits do not match targeting rules', async () => {
    const response = await request(app)
      .post('/api/v1/evaluate')
      .set('x-test-environment-id', '676a1b2c3d4e5f6a7b8c9d0e')
      .send({
        identifier: 'user_456',
        traits: { plan: 'free' }
      });

    expect(response.status).toBe(200);
    expect(response.body.flags.premium_feature).toBe(false);
  });
});