export const TZ = "America/Detroit";
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Today's date (YYYY-MM-DD) in Wixom, MI. */
export function todayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return parts; // en-CA formats as YYYY-MM-DD
}

/** Parse YYYY-MM-DD as a UTC date so arithmetic never shifts the day. */
export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

export function dow(iso: string): number {
  return parseIso(iso).getUTCDay();
}

/** "NOV 24" */
export function shortLabel(iso: string): string {
  const d = parseIso(iso);
  return `${SHORT[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** "Tuesday, November 24" */
export function longLabel(iso: string): string {
  const d = parseIso(iso);
  const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()];
  return `${day}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
