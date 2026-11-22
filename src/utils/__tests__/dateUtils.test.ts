import { describe, it, expect } from 'vitest';
import { getSundayOfWeek, getMondayOfWeek, formatLocalDate } from '../dateUtils';

describe('dateUtils', () => {
  it('formats local date to YYYY-MM-DD properly without timezone shift', () => {
    const d = new Date(2026, 10, 22); // Nov 22, 2026 (Sunday)
    expect(formatLocalDate(d)).toBe('2026-11-22');
  });

  it('correctly calculates Sunday as start of the week', () => {
    // 2026-11-22 is a Sunday (getDay() = 0)
    const sunday = new Date(2026, 10, 22);
    const resultSunday = getSundayOfWeek(sunday);
    expect(resultSunday.getDay()).toBe(0);
    expect(formatLocalDate(resultSunday)).toBe('2026-11-22');

    // 2026-11-25 is a Wednesday (getDay() = 3)
    const wednesday = new Date(2026, 10, 25);
    const resultFromWed = getSundayOfWeek(wednesday);
    expect(resultFromWed.getDay()).toBe(0);
    expect(formatLocalDate(resultFromWed)).toBe('2026-11-22');

    // 2026-11-28 is a Saturday (getDay() = 6)
    const saturday = new Date(2026, 10, 28);
    const resultFromSat = getSundayOfWeek(saturday);
    expect(resultFromSat.getDay()).toBe(0);
    expect(formatLocalDate(resultFromSat)).toBe('2026-11-22');
  });

  it('calculates Monday of the week correctly', () => {
    const wednesday = new Date(2026, 10, 25);
    const monday = getMondayOfWeek(wednesday);
    expect(monday.getDay()).toBe(1);
    expect(formatLocalDate(monday)).toBe('2026-11-23');
  });
});
