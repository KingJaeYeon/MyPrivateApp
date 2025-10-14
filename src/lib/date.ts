import { subDays } from 'date-fns';

/** 최근 N일 → ISO8601 */
export function isoAfterNDays(days: number): string {
  return subDays(new Date(), days).toISOString();
}

/** ISO8601 Duration → 초 */
export function parseISODurationToSec(iso: string): number {
  const r = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const m = r.exec(iso) || [];
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  return h * 3600 + min * 60 + s;
}

/** 초 → "M:SS" 또는 "H:MM:SS" */
export function formatDuration(sec: number): string {
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
