// 연습 모드용 가상 태양 전지 모형(교육용 단순 모형). 정성적 경향만 맞으면 된다.
export interface DemoParams {
  Voc0: number;
  Isc0: number;
  Ns: number;
  R: number;
}
export const DEMO_DEFAULT: DemoParams = { Voc0: 7.2, Isc0: 0.55, Ns: 12, R: 15 };

export interface DemoInput {
  G: number; // 일사량 W/m²
  angleDeg: number; // 태양 빛과 태양 전지 면이 이루는 각
  T: number; // 표면 온도 ℃
}

export interface DemoOutput {
  V: number;
  I: number;
  P: number;
}

/** 잡음 없이 계산(테스트용) */
export function demoSolve({ G, angleDeg, T }: DemoInput, p: DemoParams = DEMO_DEFAULT): DemoOutput {
  const sin = Math.sin((Math.max(0, Math.min(90, angleDeg)) * Math.PI) / 180);
  const Geff = G * sin + 0.1 * G; // 산란광
  const Iph = p.Isc0 * (Geff / 1000);
  let Voc = p.Voc0 * (1 - 0.0035 * (T - 25)) + 0.03 * p.Ns * Math.log(Math.max(Geff, 1) / 1000);
  if (Voc < 0) Voc = 0;
  const Icurve = (V: number) => Iph * (1 - Math.exp((V - Voc) / (0.04 * p.Ns)));
  // 부하선 V = I·R 과의 교점을 이분법으로
  let lo = 0;
  let hi = Voc;
  for (let k = 0; k < 60; k += 1) {
    const mid = (lo + hi) / 2;
    const f = Icurve(mid) - mid / p.R; // 전지 전류 − 부하 전류
    if (f > 0) lo = mid;
    else hi = mid;
  }
  const V = (lo + hi) / 2;
  const I = Math.max(0, V / p.R);
  return { V, I, P: V * I };
}

/** 잡음 ±1% 포함 */
export function demoSample(input: DemoInput, p: DemoParams = DEMO_DEFAULT): DemoOutput {
  const { V, I } = demoSolve(input, p);
  const noise = () => 1 + (Math.random() * 2 - 1) * 0.01;
  const v = V * noise();
  const i = I * noise();
  return { V: v, I: i, P: v * i };
}
