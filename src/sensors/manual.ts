// 직접 입력 모드: 센서 연결이 안 될 때의 비상 수단. 입력 칸의 값을 0.5초마다 표본으로 내보낸다.
import { config } from '../content/config';
import type { Provider, Role, Sample } from './types';

export class ManualProvider implements Provider {
  kind = 'manual' as const;
  private listeners = new Set<(s: Sample) => void>();
  private values: { V?: number; I?: number; G?: number; T?: number } = {};
  private active = new Set<Role>();
  private timer: number | null = null;

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

  set(partial: { V?: number; I?: number; G?: number; T?: number }) {
    this.values = { ...this.values, ...partial };
  }

  get() {
    return this.values;
  }

  private tick() {
    const t = Date.now();
    const s: Sample = { t };
    if (this.active.has('energy') && this.values.V !== undefined && this.values.I !== undefined) {
      s.V = this.values.V;
      s.I = this.values.I;
    }
    if (this.active.has('irradiance') && this.values.G !== undefined) s.G = this.values.G;
    if (this.active.has('surfaceTemp') && this.values.T !== undefined) s.T = this.values.T;
    if (s.V !== undefined || s.G !== undefined || s.T !== undefined) for (const l of this.listeners) l(s);
  }
}
