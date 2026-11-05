'use strict';
const fs = require('fs');
const path = require('path');
const rooms = require('./rooms/repository');

const PROPERTY = 'harbour-view';
const DAY = 24 * 60 * 60 * 1000;

/** The rows of a seed CSV as objects keyed by its header (the files hold plain comma-separated values). */
function readCsv(file) {
  const [header, ...rows] = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim());
  const keys = header.split(',').map((k) => k.trim());
  return rows.map((row) => {
    const cells = row.split(',').map((c) => c.trim());
    return Object.fromEntries(keys.map((k, i) => [k, cells[i]]));
  });
}

/**
 * Loads Harbour View, its rooms and housekeepers - once. Every room gets one stay, checked in a day before the clock
 * given to seed, to the whole second. A second start finds the property and adds nothing.
 */
async function seed({ settings, clock }) {
  if (await rooms.propertyExists(PROPERTY)) return;
  const roomRows = readCsv(path.join(settings.seedDir, 'rooms.csv'));
  const checkedInAt = new Date(Math.floor((clock.now().getTime() - DAY) / 1000) * 1000);
  await rooms.addProperty({
    slug: PROPERTY,
    name: 'Harbour View',
    rooms: roomRows.map((r) => ({ no: r.no, floor: Number(r.floor), type: r.type })),
    housekeepers: readCsv(path.join(settings.seedDir, 'housekeepers.csv')).map((h) => ({ id: h.id, name: h.name })),
    stays: roomRows.map((r, i) => ({
      roomId: r.no,stayId: `ST${String(i + 1).padStart(4, '0')}`,  guestRef: `guest-${r.no}`, checkedInAt,
    })),
  });
}

module.exports = { seed };