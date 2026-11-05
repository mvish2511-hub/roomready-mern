'use strict';
const { NoSuchRoom, RoomNotOccupied, ValidationError } = require('../errors');
const { wholeSecond, iso } = require('../time');

const PROPERTY = 'harbour-view';

/** A time rule broken: answered like any malformed body, naming the field. */
function invalid(field, message) {
  return new ValidationError([{ field, message }]);
}

function makeCheckoutService({ checkouts, rooms, clock }) {
  /**
   * The guest in this room leaves at `at`: the stay is checked out and the room becomes dirty. Refused if the room has
   * no guest; the times must make sense by the clock: not in the future, not before check-in, an arrival not before
   * the checkout.
   */
  async function checkout({ room: no, at, arrivalAt }) {
    if (!(await rooms.room(PROPERTY, no))) throw new NoSuchRoom(no);
        const stay = await rooms.currentStay(PROPERTY, no);
    if (!stay || stay.checkedOutAt !== null) throw new RoomNotOccupied(no);
    const checkedOutAt = wholeSecond(new Date(at));
    if (checkedOutAt > clock.now()) throw invalid('at', 'must not be in the future');
    if (checkedOutAt < stay.checkedInAt) throw invalid('at', 'must not be before the check-in');
    const arrival = arrivalAt ? wholeSecond(new Date(arrivalAt)) : null;
    if (arrival && arrival < checkedOutAt) throw invalid('arrivalAt', 'must not be before the checkout');
    await checkouts.checkOut(stay.stayId, { checkedOutAt, arrivalAt: arrival });
    return { stayId: stay.stayId, room: no, checkedOutAt: iso(checkedOutAt), state: 'dirty' };
  }

  return { checkout };
}

module.exports = { makeCheckoutService };
