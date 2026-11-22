import Fraction from 'fraction.js';

/**
 * Parses user input (string or number) into a Fraction object.
 * Handles inputs like: "1/2", "1 1/2", "0.75", 2, "3"
 */
export function parseQuantity(input: string | number | undefined | null): Fraction {
  if (input === undefined || input === null || input === '') {
    return new Fraction(0);
  }

  if (typeof input === 'number') {
    if (isNaN(input)) return new Fraction(0);
    return new Fraction(input);
  }

  const trimmed = input.trim();
  if (!trimmed) return new Fraction(0);

  try {
    // Handle mixed numbers like "1 1/2" -> 1 + 1/2
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2 && parts[1].includes('/')) {
      const whole = new Fraction(parts[0]);
      const frac = new Fraction(parts[1]);
      return whole.add(frac);
    }
    return new Fraction(trimmed);
  } catch {
    // Fallback to parseFloat
    const num = parseFloat(trimmed);
    return isNaN(num) ? new Fraction(0) : new Fraction(num);
  }
}

/**
 * Formats a numeric quantity or Fraction object into a friendly display string.
 * Examples:
 * 1.5 -> "1 1/2"
 * 0.75 -> "3/4"
 * 2 -> "2"
 * 0.333333 -> "1/3"
 */
export function formatQuantity(amount: number | Fraction | undefined | null): string {
  if (amount === undefined || amount === null) return '';

  let frac: Fraction;
  try {
    frac = amount instanceof Fraction ? amount : new Fraction(amount);
  } catch {
    return typeof amount === 'number' ? amount.toString() : '';
  }

  if (frac.valueOf() === 0) return '';

  const n = Number(frac.n);
  const d = Number(frac.d);

  // Whole number
  if (d === 1) {
    return n.toString();
  }

  // If denominator is large (e.g. float inaccuracies), round to nearest 1/16th
  if (d > 16) {
    const val = frac.valueOf();
    const whole = Math.floor(val);
    const decimal = val - whole;
    const rounded16th = Math.round(decimal * 16) / 16;
    if (rounded16th === 0) return whole > 0 ? whole.toString() : '';
    if (rounded16th === 1) return (whole + 1).toString();
    const approx = new Fraction(rounded16th);
    const appN = Number(approx.n);
    const appD = Number(approx.d);
    return whole > 0 ? `${whole} ${appN}/${appD}` : `${appN}/${appD}`;
  }

  const whole = Math.floor(n / d);
  const remainder = n % d;

  if (whole > 0 && remainder > 0) {
    return `${whole} ${remainder}/${d}`;
  }

  return `${n}/${d}`;
}

/**
 * Adds two quantities safely and returns the resulting amount and formatted string.
 */
export function addQuantities(
  qty1: number | string | Fraction,
  qty2: number | string | Fraction
): { amount: number; display: string } {
  const f1 = qty1 instanceof Fraction ? qty1 : parseQuantity(qty1);
  const f2 = qty2 instanceof Fraction ? qty2 : parseQuantity(qty2);
  const sum = f1.add(f2);
  return {
    amount: sum.valueOf(),
    display: formatQuantity(sum),
  };
}

/**
 * Multiplies a quantity by a serving multiplier (e.g. 1.5x, 2x).
 */
export function scaleQuantity(
  qty: number | string | Fraction,
  multiplier: number
): { amount: number; display: string } {
  const f = qty instanceof Fraction ? qty : parseQuantity(qty);
  const scaled = f.mul(new Fraction(multiplier));
  return {
    amount: scaled.valueOf(),
    display: formatQuantity(scaled),
  };
}
