// 수직 막대의 그림자 길이로 「태양 빛과 태양 전지 면이 이루는 각」을 구한다.
const DEG = Math.PI / 180;

/** 목표 각도(°)에 맞는 그림자 길이(cm). 90° → 0, 0° → Infinity */
export function shadowLength(pinHeightCm: number, angleDeg: number): number {
  if (angleDeg >= 90) return 0;
  if (angleDeg <= 0) return Infinity;
  return pinHeightCm / Math.tan(angleDeg * DEG);
}

/** 잰 그림자 길이(cm)로 실제 각도(°) */
export function angleFromShadow(pinHeightCm: number, shadowCm: number): number {
  if (shadowCm <= 0) return 90;
  return Math.atan(pinHeightCm / shadowCm) / DEG;
}

export function fmtShadow(cm: number): string {
  if (!Number.isFinite(cm)) return '끝없이 길어짐';
  return `${cm.toFixed(1)} cm`;
}

/** 독서대를 어느 쪽으로 몇 도 세울지 안내 문구. sunAlt = 현재 태양 고도(°), target = 목표 각(°) */
export function tiltAdvice(target: number, sunAlt: number): string {
  const diff = target - sunAlt;
  if (Math.abs(diff) < 1) return '독서대를 거의 평평하게(태양 고도와 같음) 두세요.';
  if (diff > 0) return `독서대를 태양 쪽으로 약 ${Math.round(diff)}° 세우세요.`;
  return `독서대를 태양 반대쪽으로 돌려 약 ${Math.round(-diff)}° 세우세요.`;
}
