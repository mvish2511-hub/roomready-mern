'use strict';
const { testDatabase } = require('./helpers');

const db = testDatabase('checkouts');
beforeAll(() => db.start());
afterAll(() => db.stop());

test('a checkout makes room 214 dirty', async () => {
  const res = await db.api().post('/checkouts').send({ room: '214', at: '2026-09-28T10:40:00Z' });

  expect(res.status).toBe(201);
  expect(res.body.state).toBe('dirty');
  expect((await db.api().get('/properties/harbour-view/rooms/214')).body.state).toBe('dirty');
});

test('checking out a room with no guest is a 400 room-not-occupied', async () => {
  const res = await db.api().post('/checkouts').send({ room: '214', at: '2026-09-28T10:40:00Z' });

  expect(res.status).toBe(400);
  expect(res.body.type).toBe('/errors/room-not-occupied');
});

test('a checkout in the future is a 400 validation problem naming at', async () => {
  const res = await db.api().post('/checkouts').send({ room: '215', at: '2026-09-28T11:10:00Z' });

  expect(res.status).toBe(400);
  expect(res.body.type).toBe('/errors/validation');
  expect(res.body.errors.map((e) => e.field)).toContain('at');
});