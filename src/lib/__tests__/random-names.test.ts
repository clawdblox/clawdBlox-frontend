import { describe, it, expect } from 'vitest';
import { getRandomName } from '../random-names';

describe('getRandomName', () => {
  it('should return a non-empty string', () => {
    const name = getRandomName();
    expect(name).toBeTruthy();
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('should return names <= 100 characters', () => {
    for (let i = 0; i < 100; i++) {
      const name = getRandomName();
      expect(name.length).toBeLessThanOrEqual(100);
    }
  });

  it('should generate varied names (at least 5 unique over 50 calls)', () => {
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) {
      names.add(getRandomName());
    }
    expect(names.size).toBeGreaterThanOrEqual(5);
  });

  it('should not have leading or trailing whitespace', () => {
    for (let i = 0; i < 50; i++) {
      const name = getRandomName();
      expect(name).toBe(name.trim());
    }
  });
});
