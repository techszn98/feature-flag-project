const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Identity = require('../../src/modules/identities/identity.model');

describe('Identity Traits Management', () => {
  let testEnvironmentId;

  beforeAll(async () => {
    testEnvironmentId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await Identity.deleteMany({});
  });

  it('should create a new identity with traits on first evaluation', async () => {
    await request(app)
      .post('/api/v1/evaluate')
      .set('x-test-environment-id', testEnvironmentId.toString())
      .send({
        identifier: 'new_user',
        traits: { plan: 'premium', country: 'Nigeria' }
      });

    const identity = await Identity.findOne({ identifier: 'new_user' });
    expect(identity).not.toBeNull();
    expect(identity.traits.plan).toBe('premium');
    expect(identity.traits.country).toBe('Nigeria');
  });

  it('should update existing identity traits on subsequent evaluations', async () => {
    await Identity.create({
      environmentId: testEnvironmentId,
      identifier: 'existing_user',
      traits: { plan: 'free' }
    });

    await request(app)
      .post('/api/v1/evaluate')
      .set('x-test-environment-id', testEnvironmentId.toString())
      .send({
        identifier: 'existing_user',
        traits: { plan: 'premium', age: 25 }
      });

    const identity = await Identity.findOne({ identifier: 'existing_user' });
    expect(identity.traits.plan).toBe('premium');
    expect(identity.traits.age).toBe(25);
  });
});