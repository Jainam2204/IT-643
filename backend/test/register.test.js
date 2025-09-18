require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

jest.setTimeout(20000);

describe('POST /auth/register', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST;
    if (!mongoUri) throw new Error('MONGO_URI_TEST not set in .env.test');
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
    await mongoose.disconnect();
  });

  it('should register a new user successfully with valid data', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: '202412108@dau.ac.in',
        password: 'Password123!',
        skillsHave: ['JavaScript'],
        skillsWant: ['React'],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Verification email sent.');
    expect(response.body).toHaveProperty('userId');
  });

 test("should return error for invalid name", async () => {
  const res = await request(app).post("/api/register").send({
    name: "Jenil123", // invalid because contains numbers
    email: "jenil@example.com",
    password: "Password@123",
    skills: ["JavaScript", "Node.js"],
  });

  expect(res.statusCode).toBe(400);

  // ✅ Find the error related to "name"
  const nameError = res.body.errors.find(e => e.field === "name");

  expect(nameError).toBeDefined();
  expect(nameError.message).toBe("Name must contain only letters and spaces");
});


  it('should return 400 if the password does not meet criteria', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'pass',
        skillsHave: ['JavaScript'],
        skillsWant: ['React'],
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].message).toContain('Password must be 6-14 chars, include uppercase, lowercase, digit, and special character');
  });

  it('should return 400 if skillsHave and skillsWant have overlapping skills', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        skillsHave: ['JavaScript', 'Node.js'],
        skillsWant: ['React', 'JavaScript'],
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].message).toContain('These skills cannot be in both');
  });
});
