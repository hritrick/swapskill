const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Skill = require('../models/Skill');

let token;
let userId;



beforeEach(async () => {
  await User.deleteMany({});
  await Skill.deleteMany({});
  // Register and login a test user
  const res = await request(app).post('/api/auth/register').send({
    name: 'Dev',
    email: 'dev@test.com',
    password: 'password123',
  });
  token = res.body.data.token;
  userId = res.body.data._id;
});

describe('GET /api/skills', () => {
  it('returns 200 with pagination meta', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.page).toBe(1);
    expect(typeof res.body.totalPages).toBe('number');
    expect(typeof res.body.totalCount).toBe('number');
  });

  it('filters by category', async () => {
    // Create one tech, one craft skill
    const user = await User.findById(userId);
    await Skill.create([
      { title: 'Python basics', cat: 'tech', wants: 'Guitar', owner: user._id },
      { title: 'Watercolour', cat: 'craft', wants: 'Python', owner: user._id },
    ]);

    const res = await request(app).get('/api/skills?category=tech');
    expect(res.status).toBe(200);
    res.body.data.forEach((s) => expect(s.cat).toBe('tech'));
  });

  it('respects pagination limit', async () => {
    const user = await User.findById(userId);
    // Create 5 skills
    await Skill.create(
      Array.from({ length: 5 }, (_, i) => ({
        title: `Skill ${i}`,
        cat: 'tech',
        wants: 'Anything',
        owner: user._id,
      }))
    );

    const res = await request(app).get('/api/skills?limit=2&page=1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.totalPages).toBe(3);
  });
});

describe('POST /api/skills', () => {
  it('creates a skill when authenticated (201)', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'React tutoring', wants: 'Yoga sessions', cat: 'tech' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    expect(res.body.data.title).toBe('React tutoring');
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/skills')
      .send({ title: 'React tutoring', wants: 'Yoga', cat: 'tech' });
    expect(res.status).toBe(401);
  });

  it('returns 400 with errors array for invalid category', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Valid title', wants: 'Valid want', cat: 'invalid_cat' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].field).toBe('cat');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Only title' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});

describe('PUT /api/skills/:id', () => {
  let skillId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Original title', wants: 'Yoga', cat: 'craft' });
    skillId = res.body.data._id;
  });

  it('updates skill as owner (200)', async () => {
    const res = await request(app)
      .put(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated title');
  });

  it('returns 403 for non-owner', async () => {
    // Create another user
    const other = await request(app).post('/api/auth/register').send({
      name: 'Other',
      email: 'other@test.com',
      password: 'password123',
    });
    const otherToken = other.body.data.token;

    const res = await request(app)
      .put(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Stolen title' });

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent skill', async () => {
    const res = await request(app)
      .put('/api/skills/000000000000000000000001')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Whatever' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/skills/:id', () => {
  it('deletes skill as owner (200)', async () => {
    const create = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To delete', wants: 'Yoga', cat: 'wellness' });

    const skillId = create.body.data._id;
    const res = await request(app)
      .delete(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 403 for non-owner', async () => {
    const create = await request(app)
      .post('/api/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Protected', wants: 'Yoga', cat: 'wellness' });
    const skillId = create.body.data._id;

    const other = await request(app).post('/api/auth/register').send({
      name: 'Other',
      email: 'other2@test.com',
      password: 'password123',
    });

    const res = await request(app)
      .delete(`/api/skills/${skillId}`)
      .set('Authorization', `Bearer ${other.body.data.token}`);

    expect(res.status).toBe(403);
  });
});
