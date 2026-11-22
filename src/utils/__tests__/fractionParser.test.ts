import { describe, it, expect } from 'vitest';
import { parseQuantity, formatQuantity, addQuantities, scaleQuantity } from '../fractionParser';

describe('fractionParser', () => {
  it('parses whole numbers, decimals, and string fractions', () => {
    expect(parseQuantity(2).valueOf()).toBe(2);
    expect(parseQuantity('1/2').valueOf()).toBe(0.5);
    expect(parseQuantity('1 1/2').valueOf()).toBe(1.5);
    expect(parseQuantity('0.75').valueOf()).toBe(0.75);
    expect(parseQuantity('').valueOf()).toBe(0);
    expect(parseQuantity(undefined).valueOf()).toBe(0);
  });

  it('formats amounts into friendly fractions', () => {
    expect(formatQuantity(1.5)).toBe('1 1/2');
    expect(formatQuantity(0.75)).toBe('3/4');
    expect(formatQuantity(2)).toBe('2');
    expect(formatQuantity(0.25)).toBe('1/4');
    expect(formatQuantity(0.3333333333)).toBe('1/3');
  });

  it('adds quantities accurately', () => {
    // 1/2 cup + 1/4 cup = 3/4 cup
    const res1 = addQuantities('1/2', '1/4');
    expect(res1.amount).toBe(0.75);
    expect(res1.display).toBe('3/4');

    // 1 cup + 1.5 cups = 2.5 cups -> "2 1/2"
    const res2 = addQuantities(1, 1.5);
    expect(res2.amount).toBe(2.5);
    expect(res2.display).toBe('2 1/2');

    // 1/3 + 2/3 = 1
    const res3 = addQuantities('1/3', '2/3');
    expect(res3.amount).toBe(1);
    expect(res3.display).toBe('1');
  });

  it('scales quantities by multiplier', () => {
    const res = scaleQuantity('3/4', 2);
    expect(res.amount).toBe(1.5);
    expect(res.display).toBe('1 1/2');
  });
});
