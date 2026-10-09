// 버니어 Go Direct 센서(웹 블루투스 / WebHID). @vernier/godirect 1.8.3 의 API 에 맞춤(6-1).
import godirect from '@vernier/godirect';
import { config } from '../content/config';
import { roleFromOrderCode, type ChannelInfo, type DeviceInfo, type Provider, type Role, type Sample } from './types';

const GDX_SERVICE = 'd91714ef-28b9-4f91-ba16-f0d9a604f112';

// godirect 의 타입 선언이 any 위주라 필요한 부분만 적어 둔다.
interface GdxSensor {
  number: number;
  name: string;
  unit: string;
  value: number | null;
  enabled: boolean;
  setEnabled(b: boolean): void;
  on(ev: 'value-changed', cb: (s: GdxSensor) => void): void;
  off?(ev: string, cb: (...a: unknown[]) => void): void;
}
interface GdxDevice {
  name: string;
  serialNumber: string;
  orderCode: string;
  sensors: GdxSensor[];
  keepValues: boolean;
  start(period?: number): void;
  stop(): void;
  close(): Promise<void>;
  getBatteryLevel(): Promise<number>;
  on(ev: 'device-closed' | 'device-opened', cb: () => void): void;
}

export interface ConnectResult {
  role: Role; // 실제로 배정된 역할(orderCode 기준)
  requested: Role;
  info: DeviceInfo;
  ambiguous: boolean; // 채널 자동 판별 실패 → 학생이 직접 고름
}

export interface GodirectEvents {
  onClosed(role: Role): void;
  onInfo(role: Role, info: DeviceInfo): void;
}

/** 역할별로 켤 채널 고르기(6-2) */
export function pickChannels(role: Role, sensors: GdxSensor[]): GdxSensor[] {
  const unit = (s: GdxSensor) => (s.unit || '').toLowerCase();
  const name = (s: GdxSensor) => (s.name || '').toLowerCase();
  if (role === 'energy') {
    const v = sensors.find((s) => unit(s) === 'v' || (unit(s).startsWith('v') && name(s).includes('potential')));
    const i = sensors.find((s) => unit(s) === 'ma' || (unit(s).includes('ma') && name(s).includes('current')));
    return [v, i].filter((s): s is GdxSensor => !!s);
  }
  if (role === 'irradiance') return sensors.filter((s) => unit(s).includes('w/m')).slice(0, 1);
  return sensors.filter((s) => unit(s).includes('°c') || unit(s) === 'c' || unit(s).includes('℃')).slice(0, 1);
}

function toInfo(d: GdxDevice, battery: number | null): DeviceInfo {
  const channels: ChannelInfo[] = d.sensors.map((s) => ({ number: s.number, name: s.name, unit: s.unit, enabled: s.enabled, value: s.value }));
  return { name: d.name, serialNumber: d.serialNumber, orderCode: d.orderCode, battery, channels };
}

export class GodirectProvider implements Provider {
  kind = 'godirect' as const;
  private devices = new Map<Role, GdxDevice>();
  private listeners = new Set<(s: Sample) => void>();
  private batteryTimers = new Map<Role, number>();
  private lastEnergy: { V?: number; I?: number } = {};
  private events: GodirectEvents;
  constructor(events: GodirectEvents) {
    this.events = events;
  }

  onSample(cb: (s: Sample) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(s: Sample) {
    for (const l of this.listeners) l(s);
  }

  /** 반드시 사용자 클릭 안에서 호출한다. */
  async connect(requested: Role, opts: { usb?: boolean } = {}): Promise<void> {
    await this.connectDetailed(requested, opts);
  }

  async connectDetailed(requested: Role, opts: { usb?: boolean } = {}, manualChannels?: number[]): Promise<ConnectResult> {
    let native: unknown;
    if (opts.usb) {
      const nav = navigator as Navigator & { hid?: { requestDevice(o: unknown): Promise<unknown[]> } };
      if (!nav.hid) throw new Error('NO_HID');
      const list = await nav.hid.requestDevice({ filters: [{ vendorId: 0x08f7, productId: 0x0010 }] });
      native = list[0];
      if (!native) throw new Error('CANCELLED');
    } else {
      if (!navigator.bluetooth) throw new Error('NO_BLUETOOTH');
      native = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'GDX' }], optionalServices: [GDX_SERVICE] });
    }
    const device = (await godirect.createDevice(native as never, { open: true, startMeasurements: false })) as unknown as GdxDevice;
    device.keepValues = false; // 값이 배열에 끝없이 쌓이지 않게
    const detected = roleFromOrderCode(device.orderCode);
    const role: Role = detected ?? requested;

    // 이미 같은 역할이 연결돼 있으면 끊는다
    if (this.devices.has(role)) await this.disconnect(role);

    device.sensors.forEach((s) => s.setEnabled(false));
    let chans = manualChannels ? device.sensors.filter((s) => manualChannels.includes(s.number)) : pickChannels(role, device.sensors);
    const ambiguous = !detected || chans.length === 0 || (role === 'energy' && chans.length < 2 && !manualChannels);
    if (ambiguous && !manualChannels) chans = [];

    chans.forEach((s) => {
      s.setEnabled(true);
      s.on('value-changed', (sensor) => this.onValue(role, sensor));
    });
    device.on('device-closed', () => {
      this.devices.delete(role);
      const t = this.batteryTimers.get(role);
      if (t) window.clearInterval(t);
      this.events.onClosed(role);
    });
    this.devices.set(role, device);
    if (chans.length) device.start(config.sampling.periodMs);

    let battery: number | null = null;
    try {
      battery = await device.getBatteryLevel();
    } catch {
      battery = null;
    }
    const info = toInfo(device, battery);
    this.events.onInfo(role, info);
    const timer = window.setInterval(async () => {
      try {
        const b = await device.getBatteryLevel();
        this.events.onInfo(role, toInfo(device, b));
      } catch {
        /* 무시 */
      }
    }, 5 * 60 * 1000);
    this.batteryTimers.set(role, timer);
    return { role, requested, info, ambiguous };
  }

  /** 자동 판별에 실패한 기기에 채널을 직접 지정 */
  enableChannels(role: Role, numbers: number[]) {
    const d = this.devices.get(role);
    if (!d) return;
    d.stop();
    d.sensors.forEach((s) => s.setEnabled(false));
    d.sensors
      .filter((s) => numbers.includes(s.number))
      .forEach((s) => {
        s.setEnabled(true);
        s.on('value-changed', (sensor) => this.onValue(role, sensor));
      });
    d.start(config.sampling.periodMs);
    this.events.onInfo(role, toInfo(d, null));
  }

  private onValue(role: Role, sensor: GdxSensor) {
    const v = sensor.value;
    if (v === null || v === undefined || !Number.isFinite(v)) return;
    const unit = (sensor.unit || '').toLowerCase();
    const t = Date.now();
    if (role === 'energy') {
      if (unit.includes('ma')) this.lastEnergy.I = v / 1000;
      else if (unit === 'a') this.lastEnergy.I = v;
      else this.lastEnergy.V = v;
      if (this.lastEnergy.V !== undefined && this.lastEnergy.I !== undefined) this.emit({ t, V: this.lastEnergy.V, I: this.lastEnergy.I });
    } else if (role === 'irradiance') this.emit({ t, G: v });
    else this.emit({ t, T: v });
  }

  async disconnect(role: Role): Promise<void> {
    const d = this.devices.get(role);
    const t = this.batteryTimers.get(role);
    if (t) window.clearInterval(t);
    this.batteryTimers.delete(role);
    if (!d) return;
    this.devices.delete(role);
    try {
      d.stop();
      await d.close();
    } catch {
      /* 이미 끊긴 경우 */
    }
  }

  async disconnectAll() {
    for (const r of Array.from(this.devices.keys())) await this.disconnect(r);
  }

  getInfo(role: Role): DeviceInfo | undefined {
    const d = this.devices.get(role);
    return d ? toInfo(d, null) : undefined;
  }
}

/** 흔한 오류를 한국어로 */
export function describeError(e: unknown): string | null {
  const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  if (/NotFoundError|CANCELLED|No device selected|cancelled/i.test(msg)) return null; // 선택 창을 그냥 닫음 → 조용히 무시
  if (/NO_BLUETOOTH/.test(msg)) return '이 브라우저는 블루투스 연결이 안 돼요. 윈도우 노트북·크롬북·안드로이드 태블릿의 크롬으로 열어 주세요.';
  if (/NO_HID/.test(msg)) return '이 브라우저는 USB(WebHID) 연결이 안 돼요. 크롬으로 열어 주세요.';
  if (/SecurityError|NotAllowedError|permission/i.test(msg))
    return '블루투스 사용 권한이 없어요. 브라우저 주소창 왼쪽 자물쇠에서 블루투스를 허용하고, 안드로이드는 위치 권한도 켜 주세요.';
  if (/Bluetooth adapter not available|not available|powered off/i.test(msg)) return '기기의 블루투스가 꺼져 있어요. 설정에서 블루투스를 켜고 다시 눌러 주세요.';
  return '연결에 실패했어요. 센서가 다른 기기나 Graphical Analysis 앱에 연결되어 있지 않은지 확인하고, 센서 전원을 껐다 켠 뒤 다시 눌러 보세요.';
}
