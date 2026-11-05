'use strict';
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const { connect, disconnect } = require('../src/db');
const { seed } = require('../src/seed');
const { createApp } = require('../src/app');
const { loadSettings } = require('../src/settings');

/** A fixed clock: every test runs at the same moment (the morning the guest in 214 leaves). */
const clock = { now: () => new Date('2026-09-28T10:40:00Z') };

/** An in-memory MongoDB for one test file: start() connects and seeds; api() is Supertest on a fresh app. */
function testDatabase(name) {
  let mongo;
  const settings = loadSettings();
return {
    settings,
    async start() {
      mongo = await MongoMemoryServer.create();
      await connect(mongo.getUri(name));
      await seed({ settings, clock });
    },
    api: () => request(createApp({ settings, clock })),
    async stop() {
      await disconnect();
      await mongo.stop();
    },
  };
}

module.exports = { clock, testDatabase };