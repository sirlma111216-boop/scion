import { describe, expect, it } from 'vitest';
import { angleFromShadow, shadowLength } from './shadow';

describe('그림자 계산(h = 5.0 cm)', () => {
  it('목표 각도 → 그림자 길이', () => {
    expect(shadowLength(5, 90)).toBe(0);
    expect(shadowLength(5, 60)).toBeCloseTo(2.9, 1);
    expect(Math.abs(shadowLength(5, 60) - 2.887)).toBeLessThan(0.05);
    expect(Math.abs(shadowLength(5, 45) - 5.0)).toBeLessThan(0.05);
    expect(Math.abs(shadowLength(5, 30) - 8.66)).toBeLessThan(0.05);
    expect(shadowLength(5, 0)).toBe(Infinity);
  });
  it('그림자 길이 → 각도(역계산)', () => {
    expect(angleFromShadow(5, 0)).toBe(90);
    expect(angleFromShadow(5, 2.887)).toBeCloseTo(60, 0);
    expect(angleFromShadow(5, 5)).toBeCloseTo(45, 5);
    expect(angleFromShadow(5, 8.66)).toBeCloseTo(30, 0);
  });
});
