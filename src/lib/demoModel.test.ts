import { describe, expect, it } from 'vitest';
import { demoSolve } from './demoModel';

describe('연습 모드 모형의 세 가지 경향', () => {
  it('일사량이 커지면 전력 증가', () => {
    const a = demoSolve({ G: 300, angleDeg: 90, T: 25 });
    const b = demoSolve({ G: 600, angleDeg: 90, T: 25 });
    const c = demoSolve({ G: 900, angleDeg: 90, T: 25 });
    expect(b.P).toBeGreaterThan(a.P);
    expect(c.P).toBeGreaterThan(b.P);
  });
  it('각도가 90°에 가까울수록 전력 증가', () => {
    const ps = [0, 30, 45, 60, 90].map((a) => demoSolve({ G: 900, angleDeg: a, T: 25 }).P);
    for (let i = 1; i < ps.length; i += 1) expect(ps[i]).toBeGreaterThan(ps[i - 1]);
  });
  it('온도가 높을수록 전력 감소(G = 900, 90°, 10 ℃ → 50 ℃)', () => {
    const cold = demoSolve({ G: 900, angleDeg: 90, T: 10 });
    const hot = demoSolve({ G: 900, angleDeg: 90, T: 50 });
    expect(hot.P).toBeLessThan(cold.P);
  });
});
