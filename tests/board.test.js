'use strict';
const { seed } = require('../src/seed');
const { clock, testDatabase } = require('./helpers');

const db = testDatabase('board');
beforeAll(() => db.start());
afterAll(() => db.stop());

test('starting twice still gives 60 rooms, every one occupied', async () => {
  await seed({ settings: db.settings, clock });
  await seed({ settings: db.settings, clock });

  const res = await db.api().get('/properties/harbour-view/rooms');

  expect(res.status).toBe(200);
  expect(res.body.rooms).toHaveLength(60);
  expect(res.body.rooms.every((r) => r.state === 'occupied')).toBe(true);
});

test('floor 2 has its 15 rooms', async () => {
  const res = await db.api().get('/properties/harbour-view/rooms?floor=2');

  expect(res.body.rooms).toHaveLength(15);
});

test('an unknown state is a 400 validation problem', async () => {
  const res = await db.api().get('/properties/harbour-view/rooms?state=painting');

  expect(res.status).toBe(400);
  expect(res.body.type).toBe('/errors/validation');
});

test('an unknown room is a 404 no-such-room problem', async () => {
  const res = await db.api().get('/properties/harbour-view/rooms/999');

  expect(res.status).toBe(404);
  expect(res.body.type).toBe('/errors/no-such-room');
});

test('the nine housekeepers have no open assignment yet', async () => {
  const res = await db.api().get('/properties/harbour-view/housekeepers');

  expect(res.body.housekeepers).toHaveLength(9);
  expect(res.body.housekeepers.every((h) => h.openAssignment === null)).toBe(true);
});