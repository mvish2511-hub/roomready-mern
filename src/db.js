'use strict';
const mongoose = require('mongoose');

/**
 * Opens Mongoose's default connection on the database the URI names, then waits until every model's unique indexes
 * exist, so no write (the seed of a second start included) can slip in before them.
 */
async function connect(uri) {
  await mongoose.connect(uri);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = { connect, disconnect };