import { describe, expect, it } from 'vitest';
import { checkGuards, isStable } from './guards';

describe('통제 변인 지킴이', () => {
  it('일사량 5% 초과 변화', () => {
    expect(checkGuards({ G: 800 }, { G: 830 }, undefined, 0).irrChanged).toBe(false); // 3.75%
    expect(checkGuards({ G: 800 }, { G: 750 }, undefined, 0).irrChanged).toBe(true); // −6.25%
  });
  it('온도 3 ℃ 초과 변화', () => {
    expect(checkGuards({ T: 30 }, { T: 32.9 }, undefined, 0).tempChanged).toBe(false);
    expect(checkGuards({ T: 30 }, { T: 33.5 }, undefined, 0).tempChanged).toBe(true);
  });
  it('20분이 지나면 태양이 움직였다고 알림', () => {
    expect(checkGuards(undefined, {}, 0, 19 * 60000).sunMoved).toBe(false);
    expect(checkGuards(undefined, {}, 0, 21 * 60000).sunMoved).toBe(true);
  });
});

describe('안정 판정', () => {
  it('변동이 3% 미만이면 안정', () => {
    expect(isStable([1.0, 1.01, 0.99, 1.0, 1.005])).toBe(true);
    expect(isStable([1.0, 1.2, 0.8, 1.1, 0.9])).toBe(false);
    expect(isStable([1.0])).toBe(false);
  });
});
