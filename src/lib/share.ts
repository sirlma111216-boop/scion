// 공유 링크: 측정 데이터(개인정보 없음)를 짧은 배열 형식으로 줄인 뒤 lz-string 으로 압축해 #/results?d=... 에 싣는다.
// QR 코드에 들어가야 하므로(약 2,900자 한계) 숫자는 반올림하고 키 이름을 없앤다.
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { EXP_KEYS, newId, type Condition, type ExpKey, type Session, type Trial } from './model';

type TrialArr = [number, number, number, number | null, number | null, number, 0 | 1, string];
type CondArr = [string, number | null, number | null, TrialArr[], string[]];
interface Payload {
  v: 1;
  d: 0 | 1; // 연습 여부
  l: Session['load'];
  h: number; // 막대 높이
  e: Record<ExpKey, CondArr[]>;
  c?: TrialArr; // 확인 측정
  f?: { G?: number; a?: number; T?: number; n?: string };
  w: { d: string; s: string; t: string; hu: string; wi: string; r: string };
}

const r = (x: number | undefined, digits: number): number | null => (x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10 ** digits) / 10 ** digits);

function packTrial(t: Trial): TrialArr {
  return [Math.round(t.t / 1000), r(t.V, 3) as number, r(t.I, 4) as number, r(t.G, 1), r(t.T, 1), t.n, t.unstable ? 1 : 0, t.source === 'sensor' ? 's' : t.source === 'manual' ? 'm' : 'd'];
}
function unpackTrial(a: TrialArr): Trial {
  const [t, V, I, G, T, n, u, s] = a;
  return { t: t * 1000, V, I, P: V * I, G: G ?? undefined, T: T ?? undefined, n, unstable: u === 1, source: s === 's' ? 'sensor' : s === 'm' ? 'manual' : 'demo' };
}
function packCond(c: Condition): CondArr {
  return [c.label, c.target ?? null, c.measuredValue ?? null, c.trials.map(packTrial), c.alerts];
}
function unpackCond(a: CondArr): Condition {
  const [label, target, measuredValue, trials, alerts] = a;
  return { id: newId('s'), label, target: target ?? undefined, measuredValue: measuredValue ?? undefined, trials: trials.map(unpackTrial), alerts: alerts ?? [] };
}

export function encodeShare(session: Session): string {
  const payload: Payload = {
    v: 1,
    d: session.demo ? 1 : 0,
    l: session.load ? { ...session.load, V: r(session.load.V, 3) ?? undefined, I: r(session.load.I, 4) ?? undefined, P: r(session.load.P, 4) ?? undefined, R: r(session.load.R, 1) ?? undefined } : null,
    h: session.pinHeightCm,
    e: { irr: session.experiments.irr.conditions.map(packCond), angle: session.experiments.angle.conditions.map(packCond), temp: session.experiments.temp.conditions.map(packCond) },
    c: session.confirm ? packTrial(session.confirm) : undefined,
    f: session.facility ? { G: r(session.facility.G, 1) ?? undefined, a: r(session.facility.angle, 1) ?? undefined, T: r(session.facility.T, 1) ?? undefined, n: session.facility.tempNote } : undefined,
    // 이름·장소는 싣지 않는다
    w: { d: session.weather.date, s: session.weather.sky, t: session.weather.tempC, hu: session.weather.humidity, wi: session.weather.wind, r: session.weather.rain },
  };
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(d: string): Session | null {
  try {
    const json = decompressFromEncodedURIComponent(d);
    if (!json) return null;
    const p = JSON.parse(json) as Payload;
    if (p.v !== 1 || !p.e) return null;
    const experiments = {} as Session['experiments'];
    for (const k of EXP_KEYS) experiments[k] = { key: k, conditions: (p.e[k] ?? []).map(unpackCond) };
    return {
      version: 1,
      demo: p.d === 1,
      weather: { date: p.w?.d ?? '', place: '', sky: (p.w?.s ?? '') as Session['weather']['sky'], tempC: p.w?.t ?? '', humidity: p.w?.hu ?? '', wind: p.w?.wi ?? '', rain: p.w?.r ?? '' },
      checklist: {},
      load: p.l ?? null,
      pinHeightCm: p.h ?? 5,
      experiments,
      confirm: p.c ? unpackTrial(p.c) : undefined,
      facility: p.f ? { place: '', G: p.f.G, angle: p.f.a, T: p.f.T, tempNote: p.f.n } : undefined,
      step: 0,
    };
  } catch {
    return null;
  }
}

export function shareUrl(session: Session): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#/results?d=${encodeShare(session)}`;
}
