// 반올림·평균·단위 변환. ON 입력 규칙(소수 첫째 자리)을 여기서만 다룬다.

/** 소수 n째 자리까지 반올림(부동소수 오차 보정) */
export function round(x: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round((x + Number.EPSILON * Math.sign(x)) * f) / f;
}

/** ON 입력용 값: 소수 첫째 자리 */
export const onValue = (x: number): number => round(x, 1);

export function mean(xs: number[]): number {
  if (!xs.length) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

/** mA → A */
export const mAtoA = (mA: number): number => mA / 1000;

/** 전력(W) = 전압(V) × 전류(A) */
export const power = (V: number, I: number): number => V * I;

/** 확인용 평균: 반올림한 값들의 평균, 소수 둘째 자리 */
export function checkMean(values: number[]): number {
  const rounded = values.map(onValue);
  return round(mean(rounded), 2);
}

/** 확인용 전력: 반올림한 전압 × 반올림한 전류, 소수 둘째 자리 */
export function checkPower(V: number, I: number): number {
  return round(onValue(V) * onValue(I), 2);
}

/** 숫자 표시(없으면 '–') */
export function fmt(x: number | undefined | null, digits = 1): string {
  if (x === undefined || x === null || !Number.isFinite(x)) return '–';
  return round(x, digits).toFixed(digits);
}
