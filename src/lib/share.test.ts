import { describe, expect, it } from 'vitest';
import { decodeShare, encodeShare } from './share';
import { emptySession, type Trial } from './model';

const trial = (V: number, I: number, G: number, T: number): Trial => ({ t: 1700000000000, V, I, P: V * I, G, T, n: 10, unstable: false, source: 'sensor' });

describe('공유 링크', () => {
  it('압축 → 복원 왕복', () => {
    const s = emptySession();
    s.weather.place = '운동장'; // 장소는 싣지 않는다
    s.weather.tempC = '21.5';
    s.load = { kind: 'external', V: 5.123, I: 0.3456, P: 1.77, R: 14.8 };
    s.experiments.irr.conditions[0].trials = [trial(5.1, 0.2, 880, 31)];
    s.experiments.irr.conditions[0].alerts = ['측정 중 일사량 8% 감소'];
    s.experiments.angle.conditions[1].measuredValue = 58.5;
    const d = encodeShare(s);
    const back = decodeShare(d)!;
    const t0 = back.experiments.irr.conditions[0].trials[0];
    expect(t0.V).toBe(5.1);
    expect(t0.G).toBe(880);
    expect(t0.source).toBe('sensor');
    expect(back.experiments.irr.conditions[0].alerts).toEqual(['측정 중 일사량 8% 감소']);
    expect(back.experiments.angle.conditions[1].measuredValue).toBe(58.5);
    expect(back.weather.place).toBe('');
    expect(back.weather.tempC).toBe('21.5');
    expect(back.load?.R).toBe(14.8);
    expect(back.demo).toBe(false);
  });
  it('11개 조건 × 3회(33회차)도 QR 에 들어갈 길이(2,900자 이하)', () => {
    const s = emptySession();
    for (const k of ['irr', 'angle', 'temp'] as const) {
      for (const c of s.experiments[k].conditions) {
        c.trials = [trial(5.123, 0.4321, 901.2, 30.4), trial(5.111, 0.4301, 899.7, 30.9), trial(5.098, 0.4288, 898.1, 31.5)];
        c.alerts = ['측정 중 패널 온도 +3.2℃ 변화'];
      }
    }
    expect(encodeShare(s).length).toBeLessThan(2900);
  });
  it('깨진 문자열은 null', () => {
    expect(decodeShare('not-valid')).toBeNull();
  });
});
