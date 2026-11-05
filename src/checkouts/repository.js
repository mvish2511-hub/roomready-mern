'use strict';
const { Stay } = require('../rooms/repository');

/** The guest has left: the stay's checkout, and when the next guest is due if the desk knows it. */
async function checkOut(stayId, { checkedOutAt, arrivalAt }) {
  await Stay.updateOne({ stayId }, { $set: { checkedOutAt, arrivalAt } });
}

module.exports = { checkOut };