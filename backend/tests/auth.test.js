require('./setup-env');

const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/modules/auth/user.model');
const RefreshToken = require('../src/models/refreshToken.model');
const { generateOtp, hashOtp } = require('../src/utils/otp');

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Member 6 - Auth & Account Security Flows', () => {
  const testUser = {
    email: 'member6@example.com',
    password: 'Password123!',
  };

  describe('Registration & Email Verification OTP', () => {
    it('registers a user with emailVerified=false and stores hashed OTP', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      assert.equal(res.body.success, true);
      assert.ok(res.body.data.userId);

      const user = await User.findById(res.body.data.userId).select(
        '+emailVerificationOtpHash +emailVerificationOtpExpiresAt'
      );
      assert.equal(user.email, testUser.email);
      assert.equal(user.emailVerified, false);
      assert.ok(user.emailVerificationOtpHash);
      assert.ok(user.emailVerificationOtpExpiresAt);
    });

    it('rejects duplicate email registration with 409', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      const res = await request(app).post('/api/v1/auth/register').send(testUser).expect(409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already registered/i);
    });

    it('rejects malformed email and short password', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'bad-email', password: '123' })
        .expect(400);
    });

    it('verifies email with valid OTP and clears OTP fields', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      // Seed a known OTP
      const plainOtp = '123456';
      await User.findOneAndUpdate(
        { email: testUser.email },
        {
          emailVerificationOtpHash: hashOtp(plainOtp),
          emailVerificationOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          emailVerificationAttempts: 0,
        }
      );

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: testUser.email, otp: plainOtp })
        .expect(200);

      assert.equal(res.body.success, true);

      const updated = await User.findOne({ email: testUser.email }).select(
        '+emailVerificationOtpHash'
      );
      assert.equal(updated.emailVerified, true);
      assert.equal(updated.emailVerificationOtpHash, undefined);
    });

    it('increments attempts and rejects invalid OTP', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      await User.findOneAndUpdate(
        { email: testUser.email },
        {
          emailVerificationOtpHash: hashOtp('111111'),
          emailVerificationOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          emailVerificationAttempts: 0,
        }
      );

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: testUser.email, otp: '999999' })
        .expect(400);

      assert.match(res.body.message, /invalid verification code/i);

      const user = await User.findOne({ email: testUser.email }).select(
        '+emailVerificationAttempts'
      );
      assert.equal(user.emailVerificationAttempts, 1);
    });

    it('rejects expired OTP', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      await User.findOneAndUpdate(
        { email: testUser.email },
        {
          emailVerificationOtpHash: hashOtp('123456'),
          emailVerificationOtpExpiresAt: new Date(Date.now() - 1000), // Expired
        }
      );

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: testUser.email, otp: '123456' })
        .expect(400);

      assert.match(res.body.message, /expired/i);
    });

    it('resends verification OTP and returns anti-enumeration response', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      const res = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({ email: testUser.email })
        .expect(200);

      assert.equal(res.body.success, true);
      assert.match(res.body.message, /verification code has been sent/i);

      // Unknown email gets identical message
      const resUnknown = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      assert.equal(resUnknown.body.message, res.body.message);
    });
  });

  describe('Login & Token Lifecycle', () => {
    it('logs in successfully and returns access token + refresh token', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      const res = await request(app).post('/api/v1/auth/login').send(testUser).expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.data.accessToken);
      assert.ok(res.body.data.refreshToken);
      assert.ok(res.body.data.token); // Backward compatibility alias
      assert.equal(res.body.data.user.email, testUser.email);

      // Verify refresh token recorded in DB
      const tokensCount = await RefreshToken.countDocuments();
      assert.equal(tokensCount, 1);
    });

    it('rejects wrong password with 401', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword!' })
        .expect(401);
    });

    it('fetches current user via GET /api/v1/auth/me', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      const loginRes = await request(app).post('/api/v1/auth/login').send(testUser).expect(200);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.user.email, testUser.email);
    });

    it('rotates refresh token via POST /api/v1/auth/refresh', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      const loginRes = await request(app).post('/api/v1/auth/login').send(testUser).expect(200);

      const firstRefreshToken = loginRes.body.data.refreshToken;

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: firstRefreshToken })
        .expect(200);

      assert.ok(refreshRes.body.data.accessToken);
      assert.ok(refreshRes.body.data.refreshToken);
      assert.notEqual(refreshRes.body.data.refreshToken, firstRefreshToken);

      // Attempting to reuse old refresh token must now be rejected
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: firstRefreshToken })
        .expect(401);
    });

    it('revokes refresh token on logout', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      const loginRes = await request(app).post('/api/v1/auth/login').send(testUser).expect(200);

      const refreshToken = loginRes.body.data.refreshToken;

      await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Refresh token can no longer be used
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('Password Recovery & Change Password', () => {
    it('initiates forgot password flow with generic response', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      assert.match(res.body.message, /password reset code has been sent/i);

      // Check DB has reset OTP hash
      const user = await User.findOne({ email: testUser.email }).select(
        '+passwordResetOtpHash +passwordResetOtpExpiresAt'
      );
      assert.ok(user.passwordResetOtpHash);
      assert.ok(user.passwordResetOtpExpiresAt);
    });

    it('resets password with valid OTP and allows login with new password', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      const resetOtp = '654321';
      await User.findOneAndUpdate(
        { email: testUser.email },
        {
          passwordResetOtpHash: hashOtp(resetOtp),
          passwordResetOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          passwordResetAttempts: 0,
        }
      );

      const newPassword = 'BrandNewPassword99!';
      await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: testUser.email,
          otp: resetOtp,
          newPassword,
        })
        .expect(200);

      // Old password should fail
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(401);

      // New password should succeed
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200);
    });

    it('changes password for authenticated user', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      const loginRes = await request(app).post('/api/v1/auth/login').send(testUser).expect(200);
      const token = loginRes.body.data.accessToken;

      const updatedPassword = 'ChangedPassword77!';
      await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: updatedPassword,
        })
        .expect(200);

      // Can log in with changed password
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: updatedPassword })
        .expect(200);
    });

    it('rejects change password if current password is wrong or new password is same', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
      const loginRes = await request(app).post('/api/v1/auth/login').send(testUser).expect(200);
      const token = loginRes.body.data.accessToken;

      // Wrong current password
      await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'SomeOtherPassword123!',
        })
        .expect(400);

      // Same new password
      await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: testUser.password,
          newPassword: testUser.password,
        })
        .expect(400);
    });
  });
});
