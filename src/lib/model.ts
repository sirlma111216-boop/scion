// 측정 데이터 모형. localStorage(`scion:v1`)와 공유 링크에 그대로 저장된다.
export type ExpKey = 'irr' | 'angle' | 'temp';
export const EXP_KEYS: ExpKey[] = ['irr', 'angle', 'temp'];

export type Source = 'sensor' | 'manual' | 'demo';

export interface Trial {
  t: number; // 측정 시각(ms)
  V: number; // 전압(V)
  I: number; // 전류(A)
  P: number; // 전력(W) = V × I
  G?: number; // 일사량(W/m²)
  T?: number; // 표면 온도(℃)
  n: number; // 표본 수
  unstable: boolean; // 흔들림 표시
  source: Source;
}

export interface Condition {
  id: string;
  label: string; // 「가림막 1겹」, 「60°」, 「차갑게」
  target?: number; // 각도 실험의 목표 각도(°) / 일사량 실험의 가림막 겹 수
  measuredValue?: number; // 각도 실험에서 그림자 길이로 계산한 실제 각도(°)
  trials: Trial[];
  alerts: string[]; // 지킴이가 남긴 사실(특이사항에 덧붙임)
}

export interface Experiment {
  key: ExpKey;
  conditions: Condition[];
  startedAt?: number;
  baseline?: { G?: number; T?: number }; // 이 실험의 첫 회차 값(통제 변인 지킴이 기준)
}

export interface Weather {
  date: string; // YYYY-MM-DD
  place: string;
  sky: '' | '맑음' | '구름 조금' | '구름 많음';
  tempC: string;
  humidity: string;
  wind: string;
  rain: string;
}

export interface LoadInfo {
  kind: 'internal' | 'external';
  V?: number;
  I?: number;
  P?: number;
  R?: number; // 계산된 저항(Ω)
  t?: number;
}

export interface FacilityMeasure {
  place: string;
  G?: number;
  angle?: number;
  T?: number;
  tempNote?: string; // 「기온으로 대신함」 등
  t?: number;
}

export interface Session {
  version: 1;
  demo: boolean;
  weather: Weather;
  checklist: Record<string, boolean>;
  load: LoadInfo | null;
  pinHeightCm: number;
  experiments: Record<ExpKey, Experiment>;
  confirm?: Trial; // 확인 측정(활동 4-과정 1-3번)
  facility?: FacilityMeasure;
  step: number; // 측정 도우미 진행 단계
}

export const EXP_META: Record<ExpKey, { title: string; short: string; unit: string; condHeader: string; noteHeader: string; manip: string }> = {
  irr: {
    title: '일사량에 따른 전력',
    short: '일사량',
    unit: 'W/m²',
    condHeader: '일사량(W/m²)',
    noteHeader: '나머지 변인(온도, 습도, 각도 등)을 입력해 주세요.',
    manip: '일사량',
  },
  angle: {
    title: '각도에 따른 전력',
    short: '각도',
    unit: '°',
    condHeader: '태양 전지와 태양광 각도(°)',
    noteHeader: '나머지 변인(일사량, 온도, 습도 등)을 입력해 주세요.',
    manip: '각도',
  },
  temp: {
    title: '온도에 따른 전력',
    short: '온도',
    unit: '℃',
    condHeader: '온도(℃)',
    noteHeader: '나머지 변인(일사량, 각도, 습도 등)을 입력해 주세요.',
    manip: '온도',
  },
};

let idSeq = 0;
export function newId(prefix = 'c'): string {
  idSeq += 1;
  return `${prefix}${Date.now().toString(36)}${idSeq.toString(36)}`;
}

export function defaultConditions(key: ExpKey): Condition[] {
  if (key === 'irr') return [0, 1, 2].map((n) => ({ id: newId(), label: `가림막 ${n}겹`, target: n, trials: [], alerts: [] }));
  if (key === 'angle') return [90, 60, 45, 30, 0].map((a) => ({ id: newId(), label: `${a}°`, target: a, trials: [], alerts: [] }));
  return ['차갑게', '중간', '뜨겁게'].map((l) => ({ id: newId(), label: l, trials: [], alerts: [] }));
}

export function nextCondition(key: ExpKey, existing: Condition[]): Condition {
  if (key === 'irr') {
    const n = existing.length;
    return { id: newId(), label: `가림막 ${n}겹`, target: n, trials: [], alerts: [] };
  }
  if (key === 'angle') return { id: newId(), label: '추가 각도', target: 75, trials: [], alerts: [] };
  return { id: newId(), label: `추가 ${existing.length - 2}`, trials: [], alerts: [] };
}

export function emptySession(demo = false, pinHeightCm = 5): Session {
  return {
    version: 1,
    demo,
    weather: { date: new Date().toISOString().slice(0, 10), place: '', sky: '', tempC: '', humidity: '', wind: '', rain: '' },
    checklist: {},
    load: null,
    pinHeightCm,
    experiments: {
      irr: { key: 'irr', conditions: defaultConditions('irr') },
      angle: { key: 'angle', conditions: defaultConditions('angle') },
      temp: { key: 'temp', conditions: defaultConditions('temp') },
    },
    step: 0,
  };
}

/** 조건의 대표값: 일사량 → 회차 일사량 평균, 각도 → 실측 각도 또는 목표 각도, 온도 → 회차 온도 평균 */
export function conditionValue(key: ExpKey, c: Condition): number | undefined {
  if (key === 'angle') return c.measuredValue ?? c.target;
  const vals = c.trials.map((t) => (key === 'irr' ? t.G : t.T)).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (!vals.length) return undefined;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
