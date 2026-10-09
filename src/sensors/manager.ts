// 센서 관리자(싱글턴). 역할별 공급 방식과 연결 상태, 최신 값을 들고 React 바깥에서 산다.
import { config } from '../content/config';
import { DemoProvider } from './demo';
import { GodirectProvider, describeError, type ConnectResult } from './godirect';
import { ManualProvider } from './manual';
import { ROLES, type DeviceInfo, type ProviderKind, type Role, type RoleState, type Sample } from './types';

export interface Latest {
  V?: number;
  I?: number;
  P?: number;
  G?: number;
  T?: number;
  tV?: number;
  tG?: number;
  tT?: number;
}

type Listener = () => void;

export class SensorManager {
  readonly godirect: GodirectProvider;
  readonly manual = new ManualProvider();
  readonly demo = new DemoProvider();
  roles: Record<Role, RoleState> = {
    energy: { status: 'disconnected', kind: null },
    irradiance: { status: 'disconnected', kind: null },
    surfaceTemp: { status: 'disconnected', kind: null },
  };
  latest: Latest = {};
  /** 최근 전력 이력(안정 판정·온도 추세용) */
  history: { t: number; P?: number; T?: number; G?: number }[] = [];
  private listeners = new Set<Listener>();
  private sampleListeners = new Set<(s: Sample) => void>();
  private wakeLock: { release(): Promise<void> } | null = null;

  constructor() {
    this.godirect = new GodirectProvider({
      onClosed: (role) => {
        this.roles[role] = { ...this.roles[role], status: 'lost', note: undefined };
        this.notify();
      },
      onInfo: (role, info) => {
        this.roles[role] = { ...this.roles[role], device: info };
        this.notify();
      },
    });
    const onSample = (s: Sample) => this.ingest(s);
    this.godirect.onSample(onSample);
    this.manual.onSample(onSample);
    this.demo.onSample(onSample);
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  onSample(cb: (s: Sample) => void): () => void {
    this.sampleListeners.add(cb);
    return () => this.sampleListeners.delete(cb);
  }
  private notify() {
    for (const l of this.listeners) l();
  }

  private ingest(s: Sample) {
    const L = { ...this.latest };
    if (s.V !== undefined && s.I !== undefined) {
      L.V = s.V;
      L.I = s.I;
      L.P = s.V * s.I;
      L.tV = s.t;
    }
    if (s.G !== undefined) {
      L.G = s.G;
      L.tG = s.t;
    }
    if (s.T !== undefined) {
      L.T = s.T;
      L.tT = s.t;
    }
    this.latest = L;
    this.history.push({ t: s.t, P: L.P, T: L.T, G: L.G });
    const cutoff = s.t - 5 * 60 * 1000;
    while (this.history.length && this.history[0].t < cutoff) this.history.shift();
    for (const cb of this.sampleListeners) cb(s);
    this.notify();
  }

  /** 최근 n초의 전력 */
  recentPowers(sec = config.sampling.windowSec): number[] {
    const cutoff = Date.now() - sec * 1000;
    return this.history.filter((h) => h.t >= cutoff && h.P !== undefined).map((h) => h.P as number);
  }

  recentTemps(): { t: number; T: number }[] {
    return this.history.filter((h) => h.T !== undefined).map((h) => ({ t: h.t, T: h.T as number }));
  }

  kindOf(role: Role): ProviderKind | null {
    return this.roles[role].kind;
  }

  isConnected(role: Role): boolean {
    return this.roles[role].status === 'connected';
  }

  allConnected(): boolean {
    return ROLES.every((r) => this.isConnected(r));
  }

  anyDemo(): boolean {
    return ROLES.some((r) => this.roles[r].kind === 'demo');
  }

  /** 블루투스/USB 연결. 반드시 클릭 안에서. */
  async connectGodirect(requested: Role, usb = false): Promise<ConnectResult | null> {
    this.roles[requested] = { ...this.roles[requested], status: 'connecting', error: undefined, note: undefined };
    this.notify();
    try {
      const res = await this.godirect.connectDetailed(requested, { usb });
      const role = res.role;
      if (role !== requested) {
        this.roles[requested] = { status: 'disconnected', kind: null };
        this.roles[role] = {
          status: 'connected',
          kind: 'godirect',
          device: res.info,
          note: `이건 ${roleTitle(role)}예요. ${roleTitle(role).replace(' 센서', '')} 칸에 연결했어요.`,
        };
      } else {
        this.roles[role] = { status: 'connected', kind: 'godirect', device: res.info, note: res.ambiguous ? '채널을 직접 골라 주세요.' : undefined };
      }
      this.notify();
      await this.requestWakeLock();
      return res;
    } catch (e) {
      const msg = describeError(e);
      this.roles[requested] = { ...this.roles[requested], status: 'disconnected', kind: null, error: msg ?? undefined };
      this.notify();
      return null;
    }
  }

  async connectManual(role: Role) {
    await this.disconnect(role);
    await this.manual.connect(role);
    this.roles[role] = { status: 'connected', kind: 'manual' };
    this.notify();
  }

  async connectDemo(role: Role) {
    await this.disconnect(role);
    await this.demo.connect(role);
    this.roles[role] = { status: 'connected', kind: 'demo' };
    this.notify();
  }

  async connectDemoAll() {
    for (const r of ROLES) await this.connectDemo(r);
  }

  async disconnect(role: Role) {
    const k = this.roles[role].kind;
    if (k === 'godirect') await this.godirect.disconnect(role);
    else if (k === 'manual') await this.manual.disconnect(role);
    else if (k === 'demo') await this.demo.disconnect(role);
    this.roles[role] = { status: 'disconnected', kind: null };
    const L = { ...this.latest };
    if (role === 'energy') {
      delete L.V;
      delete L.I;
      delete L.P;
    } else if (role === 'irradiance') delete L.G;
    else delete L.T;
    this.latest = L;
    this.notify();
  }

  async disconnectAll() {
    for (const r of ROLES) await this.disconnect(r);
    await this.releaseWakeLock();
  }

  deviceInfo(role: Role): DeviceInfo | undefined {
    return this.roles[role].device;
  }

  async requestWakeLock() {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<{ release(): Promise<void> }> } };
      if (nav.wakeLock && !this.wakeLock) this.wakeLock = await nav.wakeLock.request('screen');
    } catch {
      /* 미지원 브라우저는 조용히 무시 */
    }
  }
  async releaseWakeLock() {
    try {
      await this.wakeLock?.release();
    } catch {
      /* 무시 */
    }
    this.wakeLock = null;
  }
}

function roleTitle(role: Role): string {
  return role === 'energy' ? '에너지 센서' : role === 'irradiance' ? '일사량 센서' : '표면 온도 센서';
}

export const sensors = new SensorManager();
