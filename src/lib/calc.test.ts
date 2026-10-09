import { describe, expect, it } from 'vitest';
import { checkMean, checkPower, mAtoA, onValue, power, round } from './calc';

describe('반올림과 평균', () => {
  it('ON 입력용 값은 소수 첫째 자리', () => {
    expect(onValue(5.63)).toBe(5.6);
    expect(onValue(5.65)).toBe(5.7);
    expect(onValue(0.04)).toBe(0.0);
    expect(round(1.005, 2)).toBe(1.01);
  });
  it('확인용 평균: 반올림한 세 값의 평균, 소수 둘째 자리', () => {
    expect(checkMean([5.63, 5.68, 5.71])).toBe(5.67); // 5.6, 5.7, 5.7
  });
  it('확인용 전력: 반올림한 전압 × 반올림한 전류', () => {
    expect(checkPower(5.63, 0.123)).toBe(0.56); // 5.6 × 0.1
  });
});

describe('단위 변환', () => {
  it('mA → A', () => {
    expect(mAtoA(1000)).toBe(1);
    expect(mAtoA(123)).toBeCloseTo(0.123, 6);
  });
  it('V × A → W', () => {
    expect(power(5, 0.2)).toBeCloseTo(1, 9);
  });
});
