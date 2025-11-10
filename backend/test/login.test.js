const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('POST /auth/login', () => {
  let user;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST;
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const hashedPassword = await bcrypt.hash('Password123!', 10);
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      isVerified: true,
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should successfully log in a verified user with correct credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.message).toBe('Login Success');
  });

  it('should return 400 for incorrect password', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 400 if user is not verified', async () => {
    await User.create({
      name: 'Unverified User',
      email: 'unverified@example.com',
      password: 'Password123!',
      isVerified: false,
    });

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'unverified@example.com',
        password: 'Password123!',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should return 400 for a nonexistent email', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});