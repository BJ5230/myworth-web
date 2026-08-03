export const moneyFormatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 2,
});

export function formatMYR(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0).replace('MYR', 'RM');
}

export function toNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function todayMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthEndLabel(date = new Date()): string {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return end.toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function normalizeVisitTime(value: string): string | null {
  const trimmed = value.trim();
  const compact = trimmed.replace(/\D/g, '');
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  const hourText = match ? match[1] : compact.length === 3 ? compact.slice(0, 1) : compact.slice(0, 2);
  const minuteText = match ? match[2] : compact.slice(-2);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatVisitDateTime(value: string): string {
  return new Date(value).toLocaleString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}
