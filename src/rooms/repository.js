'use strict';
const mongoose = require('mongoose');

const Property = mongoose.model('Property', new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
}, { collection: 'properties' }));

const roomSchema = new mongoose.Schema({
  propertyId: { type: String, required: true },
  no: { type: String, required: true },
  floor: { type: Number, required: true },
  type: { type: String, enum: ['Standard', 'Deluxe', 'Suite'], required: true },
  outOfOrder: { type: Boolean, default: false },
}, { collection: 'rooms' });
roomSchema.index({ propertyId: 1, no: 1 }, { unique: true });
const Room = mongoose.model('Room', roomSchema);

const Housekeeper = mongoose.model('Housekeeper', new mongoose.Schema({
  propertyId: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
}, { collection: 'housekeepers' }));

const Stay = mongoose.model('Stay', new mongoose.Schema({
  propertyId: { type: String, required: true },
  roomId: { type: String, required: true },
  stayId: { type: String, required: true, unique: true },
  guestRef: { type: String, required: true },
  checkedInAt: { type: Date, required: true },
  checkedOutAt: { type: Date, default: null },
  arrivalAt: { type: Date, default: null },
}, { collection: 'stays' }));

function propertyExists(slug) {
  return Property.exists({ slug });
}

/** The property, its rooms and housekeepers, and one stay per room - written at the first start only. */
async function addProperty({ slug, name, rooms, housekeepers, stays }) {
  await Property.create({ slug, name });
  await Room.insertMany(rooms.map((r) => ({ propertyId: slug, ...r })));
  await Housekeeper.insertMany(housekeepers.map((h) => ({ propertyId: slug, ...h })));
  await Stay.insertMany(stays.map((st) => ({ propertyId: slug, ...st })));
}

/** A property's rooms in room-number order, as plain objects. */
function roomsOf(propertyId) {
  return Room.find({ propertyId }).sort({ no: 1 }).lean();
}

function room(propertyId, no) {
  return Room.findOne({ propertyId, no }).lean();
}

function housekeepersOf(propertyId) {
  return Housekeeper.find({ propertyId }).sort({ id: 1 }).lean();
}

/** The room's current stay: its latest by check-in, or null. */
function currentStay(propertyId, roomId) {
  return Stay.findOne({ propertyId, roomId }).sort({ checkedInAt: -1 }).lean();
}

/** The current stay of each of these rooms (the latest by check-in), keyed by room number. */
async function currentStays(propertyId, roomNos) {
  const stays = await Stay.find({ propertyId, roomId: { $in: roomNos } }).sort({ checkedInAt: 1 }).lean();
  return new Map(stays.map((st) => [st.roomId, st]));
}

module.exports = { Stay, propertyExists, addProperty, roomsOf, room, housekeepersOf, currentStay, currentStays };