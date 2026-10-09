import { describe, expect, it } from 'vitest';
import { dataSentence, precisionWarnings, bestValues } from './analysis';
import { emptySession, type Trial } from './model';

const trial = (V: number, I: number, extra: Partial<Trial> = {}): Trial => ({
  t: 0,
  V,
  I,
  P: V * I,
  n: 10,
  unstable: false,
  source: 'demo',
  ...extra,
});

describe('정밀도 경고', () => {
  it('반올림한 전류가 0.0 A인 회차', () => {
    const s = emptySession();
    s.experiments.irr.conditions[0].trials = [trial(5.2, 0.04)];
    const w = precisionWarnings('irr', s.experiments.irr);
    expect(w[0]).toContain('0.0');
    expect(w[w.length - 1]).toContain('선생님께');
  });
  it('모든 조건의 반올림 값이 같음', () => {
    const s = emptySession();
    s.experiments.angle.conditions[0].trials = [trial(5.21, 0.141)];
    s.experiments.angle.conditions[1].trials = [trial(5.24, 0.144)];
    const w = precisionWarnings('angle', s.experiments.angle);
    expect(w.some((x) => x.includes('차이가 보이지 않아요'))).toBe(true);
  });
  it('문제 없으면 경고 없음', () => {
    const s = emptySession();
    s.experiments.angle.conditions[0].trials = [trial(5.2, 0.5)];
    s.experiments.angle.conditions[1].trials = [trial(4.1, 0.3)];
    expect(precisionWarnings('angle', s.experiments.angle)).toEqual([]);
  });
});

describe('내 데이터로 채운 문장', () => {
  it('데이터가 부족하면 만들지 않음', () => {
    const s = emptySession();
    s.experiments.irr.conditions[0].trials = [trial(5, 0.5, { G: 900 })];
    expect(dataSentence('irr', s.experiments.irr)).toBeUndefined();
  });
  it('일사량: 예상대로 커졌다', () => {
    const s = emptySession();
    s.experiments.irr.conditions[0].trials = [trial(5, 0.5, { G: 900 }), trial(5, 0.5, { G: 900 })];
    s.experiments.irr.conditions[1].trials = [trial(4, 0.3, { G: 500 }), trial(4, 0.3, { G: 500 })];
    const d = dataSentence('irr', s.experiments.irr)!;
    expect(d.asExpected).toBe(true);
    expect(d.text).toContain('500.0 W/m²');
    expect(d.text).toContain('커졌다');
  });
  it('온도: 차이 5% 미만이면 뚜렷한 차이 없음', () => {
    const s = emptySession();
    s.experiments.temp.conditions[0].trials = [trial(5, 0.5, { T: 20 }), trial(5, 0.5, { T: 20 })];
    s.experiments.temp.conditions[1].trials = [trial(5, 0.49, { T: 40 }), trial(5, 0.49, { T: 40 })];
    const d = dataSentence('temp', s.experiments.temp)!;
    expect(d.text).toContain('뚜렷한 차이가 없었다');
    expect(d.asExpected).toBe(false);
  });
  it('가장 좋은 조건 값', () => {
    const s = emptySession();
    s.experiments.angle.conditions[0].trials = [trial(5, 0.5)]; // 90°
    s.experiments.angle.conditions[1].trials = [trial(4, 0.3)]; // 60°
    expect(bestValues(s).angle).toBe('90');
  });
});
