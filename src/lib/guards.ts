// 통제 변인 지킴이: 임계값을 넘으면 알림 문구를 돌려준다.
export const IRR_THRESHOLD = 0.05; // 일사량 5%
export const TEMP_THRESHOLD = 3; // 온도 3 ℃
export const SUN_MOVE_MS = 20 * 60 * 1000; // 20분

export interface GuardResult {
  irrChanged: boolean;
  irrPct?: number; // 변화율(%)
  tempChanged: boolean;
  tempDiff?: number; // ℃
  sunMoved: boolean;
}

export function checkGuards(
  baseline: { G?: number; T?: number } | undefined,
  now: { G?: number; T?: number },
  startedAt: number | undefined,
  nowMs: number,
): GuardResult {
  const r: GuardResult = { irrChanged: false, tempChanged: false, sunMoved: false };
  if (baseline?.G !== undefined && now.G !== undefined && baseline.G > 0) {
    const pct = ((now.G - baseline.G) / baseline.G) * 100;
    r.irrPct = pct;
    r.irrChanged = Math.abs(pct) > IRR_THRESHOLD * 100;
  }
  if (baseline?.T !== undefined && now.T !== undefined) {
    const d = now.T - baseline.T;
    r.tempDiff = d;
    r.tempChanged = Math.abs(d) > TEMP_THRESHOLD;
  }
  if (startedAt !== undefined) r.sunMoved = nowMs - startedAt > SUN_MOVE_MS;
  return r;
}

/** 안정 판정: 최근 전력의 변동계수(표준편차 ÷ 평균) < 3% */
export const STABLE_CV = 0.03;
export function isStable(powers: number[]): boolean {
  if (powers.length < 3) return false;
  const m = powers.reduce((a, b) => a + b, 0) / powers.length;
  if (m <= 0) return false;
  const sd = Math.sqrt(powers.reduce((a, b) => a + (b - m) ** 2, 0) / (powers.length - 1));
  return sd / m < STABLE_CV;
}

/** 온도 실험 구간 안내 */
export function tempPhaseHint(T1: number | undefined, history: { t: number; T: number }[]): '' | 'mid' | 'hot' {
  if (T1 === undefined || !history.length) return '';
  const last = history[history.length - 1];
  // 1분 동안 1 ℃ 미만 변화 → 뜨겁게
  const aMinuteAgo = history.filter((h) => last.t - h.t >= 60000).pop();
  if (aMinuteAgo && Math.abs(last.T - aMinuteAgo.T) < 1 && last.T - T1 >= 8) return 'hot';
  if (last.T - T1 >= 8) return 'mid';
  return '';
}
