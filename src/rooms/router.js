'use strict';
const express = require('express');
const { z } = require('zod');
const { parse } = require('../validate');

const boardQuery = z.object({
  floor: z.coerce.number().int().min(1).max(4).optional(),
  state: z.enum(['occupied', 'dirty', 'assigned', 'cleaning', 'toinspect', 'ready', 'out_of_order']).optional(),
  type: z.enum(['Standard', 'Deluxe', 'Suite']).optional(),
});

function makeRoomRouter(service) {
  const router = express.Router();

  router.get('/properties/:property/rooms', async (req, res) => {
    res.json(await service.board(req.params.property, parse(boardQuery, req.query)));
  });

  router.get('/properties/:property/rooms/:no', async (req, res) => {
    res.json(await service.room(req.params.property, req.params.no));
  });

  router.get('/properties/:property/housekeepers', async (req, res) => {
    res.json(await service.housekeepers(req.params.property));
  });

  return router;
}

module.exports = { makeRoomRouter };