const { describe, it, before, after, beforeEach } = require('node:test');
const { expect } = require('expect');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_min_32_characters_long_for_signing';

const { app } = require('../server');
const User = require('../models/User');

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongod.getUri());
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns 201 with token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.email).toBe('alice@test.com');
    expect(res.body.data.password).toBeUndefined();
  });

  it('returns 400 when email is already registered', async () => {
    await User.create({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice 2',
      email: 'alice@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 with errors array for invalid input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'X',
      email: 'not-an-email',
      password: 'abc',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'password123',
    });
  });

  it('returns 200 and a token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.credits).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bob@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Carol',
      email: 'carol@test.com',
      password: 'password123',
    });
    token = res.body.data.token;
  });

  it('returns the authenticated user (200)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('carol@test.com');
    expect(res.body.data.password).toBeUndefined();
  });

  it('returns 401 when no token is sent', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is malformed', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});
