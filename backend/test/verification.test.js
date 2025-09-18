const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('POST /auth/verify', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should verify a user with a valid verification code', async () => {
    const user = await User.create({
      name: 'Test Verify',
      email: 'verify@example.com',
      password: 'Password123!',
      verificationCode: '123456',
      isVerified: false,
    });

    const response = await request(app)
      .post('/auth/verify')
      .send({
        userId: user._id,
        verificationCode: '123456',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Email verified successfully!');
  });

  it('should return 400 for an invalid verification code', async () => {
    const user = await User.create({
      name: 'Test Verify',
      email: 'verify@example.com',
      password: 'Password123!',
      verificationCode: '123456',
      isVerified: false,
    });

    const response = await request(app)
      .post('/auth/verify')
      .send({
        userId: user._id,
        verificationCode: '654321',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid verification code');
  });

  it('should return 400 for a nonexistent userId', async () => {
    const nonexistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .post('/auth/verify')
      .send({
        userId: nonexistentId,
        verificationCode: '123456',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'User not found');
  });
});