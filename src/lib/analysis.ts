// 결과 정리: 조건별 평균, 정밀도 경고, 내 데이터로 채운 문장, 특이사항 문구.
import { EXP_META, conditionValue, type Condition, type ExpKey, type Experiment, type LoadInfo, type Session, type Weather } from './model';
import { checkMean, checkPower, fmt, mean, onValue } from './calc';

export interface CondSummary {
  id: string;
  label: string;
  value?: number; // 조건 대표값
  meanP: number; // 정밀 평균 전력(W)
  meanV: number;
  meanI: number;
  meanG?: number;
  meanT?: number;
  n: number;
}

export function summarize(key: ExpKey, exp: Experiment): CondSummary[] {
  return exp.conditions.map((c) => {
    const ts = c.trials;
    const g = ts.map((t) => t.G).filter((x): x is number => x !== undefined);
    const tt = ts.map((t) => t.T).filter((x): x is number => x !== undefined);
    return {
      id: c.id,
      label: c.label,
      value: conditionValue(key, c),
      meanP: ts.length ? mean(ts.map((t) => t.P)) : NaN,
      meanV: ts.length ? mean(ts.map((t) => t.V)) : NaN,
      meanI: ts.length ? mean(ts.map((t) => t.I)) : NaN,
      meanG: g.length ? mean(g) : undefined,
      meanT: tt.length ? mean(tt) : undefined,
      n: ts.length,
    };
  });
}

/** 평균 전력이 가장 큰 조건 */
export function bestCondition(sums: CondSummary[]): CondSummary | undefined {
  const withData = sums.filter((s) => s.n > 0 && Number.isFinite(s.meanP));
  if (!withData.length) return undefined;
  return withData.reduce((a, b) => (b.meanP > a.meanP ? b : a));
}

/** 정밀도 경고(8-1) */
export function precisionWarnings(key: ExpKey, exp: Experiment): string[] {
  const warns: string[] = [];
  const trials = exp.conditions.flatMap((c) => c.trials);
  if (!trials.length) return warns;
  if (trials.some((t) => onValue(t.I) === 0)) warns.push('전류가 너무 작아 0.0으로 적히게 돼요.');
  const condsWithData = exp.conditions.filter((c) => c.trials.length);
  if (condsWithData.length >= 2) {
    const sig = (c: Condition) => c.trials.map((t) => `${onValue(t.V)}/${onValue(t.I)}`).join(',');
    const first = sig(condsWithData[0]);
    const allSame = condsWithData.every((c) => sig(c) === first);
    if (allSame) warns.push(`소수 첫째 자리로는 ${EXP_META[key].short} 조건 사이의 차이가 보이지 않아요.`);
  }
  if (warns.length) warns.push('선생님께 알려 주세요. (ON에 소수 둘째 자리까지 입력되는지 확인하거나, 더 큰 태양 전지·다른 부하가 필요할 수 있어요.)');
  return warns;
}

export interface OnRow {
  condId: string;
  condValue: string; // ON 입력: 조건값
  V: [string, string, string];
  I: [string, string, string];
  Vmean: string;
  Imean: string;
  P: [string, string, string];
  Pmean: string;
  Vprecise: string[];
  Iprecise: string[];
  note: string;
}

/** ON 입력용 표의 한 조건 줄 */
export function onRow(key: ExpKey, c: Condition, session: Session): OnRow {
  const t3 = [0, 1, 2].map((i) => c.trials[i]);
  const V = t3.map((t) => (t ? fmt(t.V, 1) : '')) as [string, string, string];
  const I = t3.map((t) => (t ? fmt(t.I, 1) : '')) as [string, string, string];
  const P = t3.map((t) => (t ? checkPower(t.V, t.I).toFixed(2) : '')) as [string, string, string];
  const vs = c.trials.slice(0, 3).map((t) => t.V);
  const is = c.trials.slice(0, 3).map((t) => t.I);
  const val = conditionValue(key, c);
  return {
    condId: c.id,
    condValue: val === undefined ? '' : key === 'angle' ? String(Math.round(val)) : fmt(val, 1),
    V,
    I,
    Vmean: vs.length ? checkMean(vs).toFixed(2) : '',
    Imean: is.length ? checkMean(is).toFixed(2) : '',
    P,
    Pmean: vs.length ? (P.filter(Boolean).map(Number).reduce((a, b) => a + b, 0) / P.filter(Boolean).length).toFixed(2) : '',
    Vprecise: c.trials.slice(0, 3).map((t) => t.V.toFixed(3)),
    Iprecise: c.trials.slice(0, 3).map((t) => t.I.toFixed(3)),
    note: noteText(key, c, session),
  };
}

function loadText(load: LoadInfo | null): string {
  if (!load) return '';
  if (load.kind === 'internal') return '부하 내부 30Ω';
  return load.R ? `부하 ${load.R.toFixed(0)}Ω` : '부하 외부';
}

function weatherText(w: Weather): string[] {
  const parts: string[] = [];
  if (w.tempC) parts.push(`기온 ${w.tempC}℃`);
  if (w.humidity) parts.push(`습도 ${w.humidity}%`);
  return parts;
}

/** 특이사항 문구 자동 생성(60자 안팎) */
export function noteText(key: ExpKey, c: Condition, session: Session): string {
  if (!c.trials.length) return '';
  const g = c.trials.map((t) => t.G).filter((x): x is number => x !== undefined);
  const tt = c.trials.map((t) => t.T).filter((x): x is number => x !== undefined);
  const parts: string[] = [];
  if (key === 'irr') {
    parts.push('각도 90°');
    if (tt.length) parts.push(`패널 온도 ${fmt(mean(tt), 1)}℃`);
    if (c.target !== undefined) parts.push(`가림막 ${c.target}겹`);
  } else if (key === 'angle') {
    if (g.length) parts.push(`일사량 ${Math.round(mean(g))}W/m²`);
    if (tt.length) parts.push(`패널 온도 ${fmt(mean(tt), 1)}℃`);
  } else {
    if (g.length) parts.push(`일사량 ${Math.round(mean(g))}W/m²`);
    parts.push('각도 90°');
  }
  const lt = loadText(session.load);
  if (lt) parts.push(lt);
  parts.push(...weatherText(session.weather));
  const base = parts.join(', ');
  const extra = c.alerts.length ? `, ${c.alerts.join(', ')}` : '';
  return base + extra;
}

export type Trend = 'up' | 'down' | 'flat';
function trend(pLow: number, pHigh: number): Trend {
  const ref = Math.max(Math.abs(pLow), Math.abs(pHigh));
  if (ref === 0 || Math.abs(pHigh - pLow) / ref < 0.05) return 'flat';
  return pHigh > pLow ? 'up' : 'down';
}

export interface DataSentence {
  key: ExpKey;
  text: string;
  asExpected: boolean;
}

/** 내 데이터로 채운 문장(8-3). 조건 2개 이상, 조건마다 2회 이상일 때만 */
export function dataSentence(key: ExpKey, exp: Experiment): DataSentence | undefined {
  const sums = summarize(key, exp).filter((s) => s.n >= 2 && s.value !== undefined && Number.isFinite(s.meanP));
  if (sums.length < 2) return undefined;
  const sorted = [...sums].sort((a, b) => (a.value as number) - (b.value as number));
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  if (key === 'irr') {
    const tr = trend(lo.meanP, hi.meanP);
    const word = tr === 'up' ? '커졌다' : tr === 'down' ? '작아졌다' : '뚜렷한 차이가 없었다';
    return {
      key,
      text: `일사량이 ${fmt(lo.value, 1)} W/m²일 때 평균 전력은 ${fmt(lo.meanP, 2)} W, ${fmt(hi.value, 1)} W/m²일 때 ${fmt(hi.meanP, 2)} W였다. 일사량이 클수록 전력이 ${word}.`,
      asExpected: tr === 'up',
    };
  }
  if (key === 'angle') {
    const best = sums.reduce((a, b) => (b.meanP > a.meanP ? b : a));
    const worst = sums.reduce((a, b) => (b.meanP < a.meanP ? b : a));
    return {
      key,
      text: `각도가 ${Math.round(best.value as number)}°일 때 평균 전력이 ${fmt(best.meanP, 2)} W로 가장 컸고, ${Math.round(worst.value as number)}°일 때 ${fmt(worst.meanP, 2)} W로 가장 작았다.`,
      asExpected: Math.round(best.value as number) === Math.max(...sums.map((s) => Math.round(s.value as number))),
    };
  }
  const tr = trend(hi.meanP, lo.meanP); // 온도가 낮을수록(lo) 전력이 큰가
  const word = tr === 'up' ? '컸다' : tr === 'down' ? '작았다' : '뚜렷한 차이가 없었다';
  return {
    key,
    text: `온도가 ${fmt(lo.value, 1)} ℃일 때 평균 전력은 ${fmt(lo.meanP, 2)} W, ${fmt(hi.value, 1)} ℃일 때 ${fmt(hi.meanP, 2)} W였다. 온도가 낮을수록 전력이 ${word}.`,
    asExpected: tr === 'up',
  };
}

/** 활동 4-과정 1-2번에 쓸 값 */
export function bestValues(session: Session): Record<ExpKey, string> {
  const out: Record<ExpKey, string> = { irr: '', angle: '', temp: '' };
  for (const key of ['irr', 'angle', 'temp'] as ExpKey[]) {
    const best = bestCondition(summarize(key, session.experiments[key]));
    if (best && best.value !== undefined) out[key] = key === 'angle' ? String(Math.round(best.value)) : fmt(best.value, 1);
  }
  return out;
}

/** 완료 상태 */
export function completion(session: Session): Record<ExpKey, { conds: number; done: number; missing: string[] }> {
  const out = {} as Record<ExpKey, { conds: number; done: number; missing: string[] }>;
  for (const key of ['irr', 'angle', 'temp'] as ExpKey[]) {
    const exp = session.experiments[key];
    const missing: string[] = [];
    let done = 0;
    for (const c of exp.conditions) {
      if (c.trials.length >= 3) done += 1;
      else missing.push(`${c.label} ${c.trials.length}/3회`);
    }
    out[key] = { conds: exp.conditions.length, done, missing };
  }
  return out;
}
