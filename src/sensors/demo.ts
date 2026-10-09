// 연습 모드: 가상 센서. 슬라이더(일사량·각도·온도)로 값을 만든다.
import { config } from '../content/config';
import { demoSample } from '../lib/demoModel';
import type { Provider, Role, Sample } from './types';

export interface DemoState {
  G: number;
  angleDeg: number;
  T: number;
  layers: number; // 가림막 겹 수(일사량을 자동으로 낮춤)
}

export class DemoProvider implements Provider {
  kind = 'demo' as const;
  private listeners = new Set<(s: Sample) => void>();
  private active = new Set<Role>();
  private timer: number | null = null;
  state: DemoState = { G: 900, angleDeg: 90, T: 30, layers: 0 };

  onSample(cb: (s: Sample) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  async connect(role: Role): Promise<void> {
    this.active.add(role);
    if (this.timer === null) this.timer = window.setInterval(() => this.tick(), config.sampling.periodMs);
  }

  async disconnect(role: Role): Promise<void> {
    this.active.delete(role);
    if (!this.active.size && this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  set(partial: Partial<DemoState>) {
    this.state = { ...this.state, ...partial };
  }

  /** 가림막 한 겹마다 일사량 약 45% 로 */
  effectiveG(): number {
    return this.state.G * 0.45 ** this.state.layers;
  }

  private tick() {
    const t = Date.now();
    const G = this.effectiveG() * (1 + (Math.random() * 2 - 1) * 0.01);
    const T = this.state.T + (Math.random() * 2 - 1) * 0.1;
    const { V, I } = demoSample({ G: this.effectiveG(), angleDeg: this.state.angleDeg, T: this.state.T });
    const s: Sample = { t };
    if (this.active.has('energy')) {
      s.V = V;
      s.I = I;
    }
    if (this.active.has('irradiance')) s.G = G;
    if (this.active.has('surfaceTemp')) s.T = T;
    for (const l of this.listeners) l(s);
  }
}
