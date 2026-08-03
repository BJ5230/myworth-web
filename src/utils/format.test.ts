import { describe, expect, it } from 'vitest';
import { formatVisitDateTime, normalizeVisitTime } from './format';

describe('format helpers', () => {
  it('normalizes compact visit time into HH:mm', () => {
    expect(normalizeVisitTime('1200')).toBe('12:00');
    expect(normalizeVisitTime('628')).toBe('06:28');
    expect(normalizeVisitTime('18:28')).toBe('18:28');
  });

  it('formats visit history without seconds', () => {
    expect(formatVisitDateTime('2026-08-03T10:28:00.000Z')).toMatch(/6:28 pm/i);
    expect(formatVisitDateTime('2026-08-03T10:28:00.000Z')).not.toMatch(/:00/);
  });
});
