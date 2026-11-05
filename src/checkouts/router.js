'use strict';
const express = require('express');
const { z } = require('zod');
const { parse } = require('../validate');

const checkoutBody = z.object({
  room: z.string().min(1),
  at: z.string().datetime({ offset: true }),
  arrivalAt: z.string().datetime({ offset: true }).optional()
});

function makeCheckoutRouter(service) {
  const router = express.Router();

  router.post('/checkouts', async (req, res) => {
    const out = await service.checkout(parse(checkoutBody, req.body));
    res.status(201).location(`/properties/harbour-view/rooms/${out.room}`).json(out);
  });

  return router;
}

module.exports = { makeCheckoutRouter };