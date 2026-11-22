import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { exportAllData } from '../backupService';

describe('backupService', () => {
  it('exports structured backup JSON archive with version and appName', async () => {
    const jsonStr = await exportAllData();
    const data = JSON.parse(jsonStr);

    expect(data.appName).toBe('My Cookbook');
    expect(data.version).toBe('1.0.0');
    expect(Array.isArray(data.recipes)).toBe(true);
    expect(Array.isArray(data.mealPlans)).toBe(true);
    expect(Array.isArray(data.groceryItems)).toBe(true);
  });
});
