'use strict';
const express = require('express');
const roomRepository = require('./rooms/repository');
const { makeRoomService } = require('./rooms/service');
const { makeRoomRouter } = require('./rooms/router');
const checkoutRepository = require('./checkouts/repository');
const { makeCheckoutService } = require('./checkouts/service');
const { makeCheckoutRouter } = require('./checkouts/router');
const { notFound, errorHandler } = require('./errors/middleware');

/** Builds the Express app. It never connects to the database and never listens: server.js and tests do that. */
function createApp({ settings, clock }) {
  const app = express();
  const rooms = makeRoomService({ repository: roomRepository });
  const checkouts = makeCheckoutService({ checkouts: checkoutRepository, rooms: roomRepository, clock });

  app.use(express.json());
  app.use(makeRoomRouter(rooms));
  app.use(makeCheckoutRouter(checkouts));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };