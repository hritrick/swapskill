const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');

let senderToken, recipientToken;
let senderId, recipientId;
let skillId;



beforeEach(async () => {
  await User.deleteMany({});
  await Skill.deleteMany({});
  await SwapRequest.deleteMany({});

  // Create two users
  const senderRes = await request(app).post('/api/auth/register').send({
    name: 'Sender',
    email: 'sender@test.com',
    password: 'password123',
  });
  senderToken = senderRes.body.data.token;
  senderId = senderRes.body.data._id;

  const recipientRes = await request(app).post('/api/auth/register').send({
    name: 'Recipient',
    email: 'recipient@test.com',
    password: 'password123',
  });
  recipientToken = recipientRes.body.data.token;
  recipientId = recipientRes.body.data._id;

  // Create a skill owned by recipient
  const skillRes = await request(app)
    .post('/api/skills')
    .set('Authorization', `Bearer ${recipientToken}`)
    .send({ title: 'Yoga basics', wants: 'Guitar', cat: 'wellness' });
  skillId = skillRes.body.data._id;
});

describe('POST /api/swaps', () => {
  it('creates a swap request (201)', async () => {
    const res = await request(app)
      .post('/api/swaps')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        toUser: recipientId,
        skill: skillId,
        offeredSkill: 'Guitar lessons',
        hours: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.fromUser._id).toBe(senderId);
  });

  it('returns 400 on self-proposal', async () => {
    const res = await request(app)
      .post('/api/swaps')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        toUser: senderId,
        skill: skillId,
        offeredSkill: 'Guitar lessons',
        hours: 1,
      });
    expect(res.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/swaps').send({
      toUser: recipientId,
      skill: skillId,
      offeredSkill: 'Guitar',
      hours: 1,
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid hours', async () => {
    const res = await request(app)
      .post('/api/swaps')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        toUser: recipientId,
        skill: skillId,
        offeredSkill: 'Guitar',
        hours: -1,
      });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});

describe('PATCH /api/swaps/:id', () => {
  let swapId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/swaps')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ toUser: recipientId, skill: skillId, offeredSkill: 'Guitar', hours: 1.5 });
    swapId = res.body.data._id;
  });

  it('recipient can accept (200)', async () => {
    const res = await request(app)
      .patch(`/api/swaps/${swapId}`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('accepted');
  });

  it('sender cannot accept their own swap (403)', async () => {
    const res = await request(app)
      .patch(`/api/swaps/${swapId}`)
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/swaps/${swapId}`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ status: 'maybe' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });

  it('returns 400 if swap already resolved', async () => {
    // Accept first
    await request(app)
      .patch(`/api/swaps/${swapId}`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ status: 'accepted' });

    // Try to decline after accepting
    const res = await request(app)
      .patch(`/api/swaps/${swapId}`)
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({ status: 'declined' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/swaps/me', () => {
  it('returns all swaps for authenticated user (200)', async () => {
    await request(app)
      .post('/api/swaps')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ toUser: recipientId, skill: skillId, offeredSkill: 'Guitar', hours: 1 });

    const res = await request(app)
      .get('/api/swaps/me')
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('filters to received pending swaps', async () => {
    await request(app)
      .post('/api/swaps')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({ toUser: recipientId, skill: skillId, offeredSkill: 'Guitar', hours: 1 });

    const res = await request(app)
      .get('/api/swaps/me?role=received&status=pending')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach((s) => {
      expect(s.status).toBe('pending');
      expect(s.toUser._id).toBe(recipientId);
    });
  });
});
