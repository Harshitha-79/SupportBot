// Working hours helper: compute expected resolution timestamp adding X working hours
// Working hours: 09:00-17:00 with breaks: 11:00-11:15, 13:00-14:00 (lunch), 16:45-17:00 (evening short break)
const WORK_START = { hour: 9, minute: 0 };
const WORK_END = { hour: 17, minute: 0 };
const BREAKS = [
  { start: { hour: 11, minute: 0 }, end: { hour: 11, minute: 15 } },
  { start: { hour: 13, minute: 0 }, end: { hour: 14, minute: 0 } },
  { start: { hour: 16, minute: 45 }, end: { hour: 17, minute: 0 } },
];

const toDateWith = (d, { hour, minute }) => {
  const nd = new Date(d);
  nd.setHours(hour, minute, 0, 0);
  return nd;
};

const isInWorkingDay = (dt) => {
  const start = toDateWith(dt, WORK_START);
  const end = toDateWith(dt, WORK_END);
  return dt >= start && dt < end;
};

const isInBreak = (dt) => {
  for (const b of BREAKS) {
    const s = toDateWith(dt, b.start);
    const e = toDateWith(dt, b.end);
    if (dt >= s && dt < e) return true;
  }
  return false;
};

const addWorkingMinutes = (start, minutesToAdd) => {
  let current = new Date(start);
  let remaining = minutesToAdd;

  while (remaining > 0) {
    // if not in working day, move to next work day start
    if (!isInWorkingDay(current) || isInBreak(current)) {
      // move to next working day start
      current.setDate(current.getDate() + 1);
      current = toDateWith(current, WORK_START);
      continue;
    }

    // find next break or end of day
    let nextStop = toDateWith(current, WORK_END);
    for (const b of BREAKS) {
      const bs = toDateWith(current, b.start);
      if (bs > current && bs < nextStop) nextStop = bs;
    }

    const availableMinutes = Math.floor((nextStop - current) / 60000);
    const take = Math.min(availableMinutes, remaining);
    current = new Date(current.getTime() + take * 60000);
    remaining -= take;

    if (remaining > 0) {
      // hit break or end of day, advance current accordingly
      if (isInBreak(current)) {
        // move to end of current break
        for (const b of BREAKS) {
          const bs = toDateWith(current, b.start);
          const be = toDateWith(current, b.end);
          if (current >= bs && current < be) {
            current = new Date(be);
            break;
          }
        }
      } else {
        // move to next day start
        current.setDate(current.getDate() + 1);
        current = toDateWith(current, WORK_START);
      }
    }
  }

  return current;
};

export const computeExpectedResolution = (startDate = new Date(), hours = 4) => {
  const minutes = hours * 60;
  return addWorkingMinutes(startDate, minutes);
};
