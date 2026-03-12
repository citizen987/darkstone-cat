// ---------------------------------------------------------------------------
// Event image — Catalan date/time formatting
// ---------------------------------------------------------------------------

const CATALAN_DAYS = [
  "Diumenge",
  "Dilluns",
  "Dimarts",
  "Dimecres",
  "Dijous",
  "Divendres",
  "Dissabte",
];

/**
 * Format an ISO date to Catalan day + date string.
 * Example: "Dissabte 10/01"
 */
export function formatEventDate(
  startsAt: string,
  timeZone: string
): string {
  const date = new Date(startsAt);

  // Get day-of-week in the event timezone
  const dayOfWeek = new Date(
    date.toLocaleString("en-US", { timeZone: timeZone })
  ).getDay();

  const dayName = CATALAN_DAYS[dayOfWeek];

  // Get day and month in timezone
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "2-digit",
  }).format(date);

  const month = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
  }).format(date);

  return `${dayName} ${day}/${month}`;
}

/**
 * Format start/end times to Catalan time range.
 * Example: "de 10h a 13:30h"
 */
export function formatEventTime(
  startsAt: string,
  endsAt: string,
  timeZone: string
): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hour12: false,
    }).format(d);

    const minute = new Intl.DateTimeFormat("en-US", {
      timeZone,
      minute: "2-digit",
    }).format(d);

    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    return m === 0 ? `${h}h` : `${h}:${minute}h`;
  };

  return `de ${fmt(startsAt)} a ${fmt(endsAt)}`;
}
