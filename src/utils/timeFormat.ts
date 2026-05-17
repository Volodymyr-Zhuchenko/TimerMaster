// ============================================================
// Чисті функції форматування часу — без залежностей від React.
// Використовуються у компонентах TimeDisplay та LapItem.
// ============================================================

/** Доповнює число нулями до 2 символів: 5 → "05" */
function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

/** Доповнює число нулями до 3 символів: 45 → "045" */
function pad3(n: number): string {
  return String(Math.floor(n)).padStart(3, '0');
}

/**
 * Форматує мілісекунди у рядок "ГГ:ХХ:СС.ммм".
 * Використовується у секундомірі, де важлива точність до мс.
 *
 * @example formatMs(89045) → "00:01:29.045"
 */
export function formatMs(totalMs: number): string {
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
}

/**
 * Форматує секунди у рядок "ГГ:ХХ:СС" (без мілісекунд).
 * Використовується у таймері зворотного відліку.
 *
 * @example formatSeconds(90) → "00:01:30"
 */
export function formatSeconds(totalSec: number): string {
  const s = Math.floor(totalSec) % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}
