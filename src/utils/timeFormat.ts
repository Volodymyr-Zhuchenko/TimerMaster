function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

/**
 * Splits elapsed ms into main "MM:SS" and cents "cc" (hundredths).
 * Used for the large stopwatch display (big number + smaller cents).
 */
export function formatMsDisplay(totalMs: number): { main: string; cents: string } {
  const totalSec = Math.floor(totalMs / 1000);
  const cs = Math.floor((totalMs % 1000) / 10);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const main = h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
  return { main, cents: pad2(cs) };
}

/**
 * Formats ms as "MM:SS.cc" — used in lap rows and the current-lap pill.
 */
export function formatMsLap(totalMs: number): string {
  const { main, cents } = formatMsDisplay(totalMs);
  return `${main}.${cents}`;
}

/**
 * Formats seconds as "HH:MM:SS" — used in the countdown timer.
 */
export function formatSeconds(totalSec: number): string {
  const s = Math.floor(totalSec) % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/** Legacy full-precision format kept for compatibility. */
export function formatMs(totalMs: number): string {
  return formatMsLap(totalMs);
}
