'use strict';
const { NoSuchProperty, NoSuchRoom } = require('../errors');

/** A room's state is derived from where it is in the sequence, on every read; nothing stores it. */
function stateOf(room, stay) {
  if (room.outOfOrder) return 'out_of_order';
  return !stay || stay.checkedOutAt === null ? 'occupied' : 'dirty';
}

function makeRoomService({ repository }) {
  async function requireProperty(property) {
    if (!(await repository.propertyExists(property))) throw new NoSuchProperty(property);
    }

  /** The rooms with their derived states. */
  async function shapeAll(property, rooms) {
    const stays = await repository.currentStays(property, rooms.map((r) => r.no));
    return rooms.map((r) => ({ no: r.no, floor: r.floor, type: r.type, state: stateOf(r, stays.get(r.no)) }));
  }

  /** The board, optionally one floor, state and/or type; ready and dirty count the rooms shown. */
  async function board(property, { floor, state, type } = {}) {
    await requireProperty(property);
    const rooms = (await shapeAll(property, await repository.roomsOf(property)))
    .filter((r) => (!floor || r.floor === floor) && (!state || r.state === state) && (!type || r.type === type));
    const count = (s) => rooms.filter((r) => r.state === s).length;
    return { property, ready: count('ready'), dirty: count('dirty'), rooms };
  }
  
  async function room(property, no) {
    await requireProperty(property);
    const found = await repository.room(property, no);
    if (!found) throw new NoSuchRoom(no);
    return (await shapeAll(property, [found]))[0];
  }

  /** The housekeepers, each with the room of her open assignment (none yet). */
  async function housekeepers(property) {
    await requireProperty(property);
    const list = await repository.housekeepersOf(property);
    return { housekeepers: list.map((h) => ({ id: h.id, name: h.name, openAssignment: null })) };
  }

  return { board, room, housekeepers };
}

module.exports = { makeRoomService };