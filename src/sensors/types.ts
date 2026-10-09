// 세 가지 값 공급 방식(센서/직접 입력/연습)이 같은 인터페이스로 구현된다.
export type Role = 'energy' | 'irradiance' | 'surfaceTemp';
export const ROLES: Role[] = ['energy', 'irradiance', 'surfaceTemp'];

export interface Sample {
  t: number;
  V?: number;
  I?: number; // A
  G?: number; // W/m²
  T?: number; // ℃
}

export type ProviderKind = 'godirect' | 'manual' | 'demo';

export interface Provider {
  kind: ProviderKind;
  connect(role: Role, opts?: { usb?: boolean }): Promise<void>;
  onSample(cb: (s: Sample) => void): () => void;
  disconnect(role: Role): Promise<void>;
}

export type ConnStatus = 'disconnected' | 'connecting' | 'connected' | 'lost';

export interface ChannelInfo {
  number: number;
  name: string;
  unit: string;
  enabled: boolean;
  value: number | null;
}

export interface DeviceInfo {
  name: string;
  serialNumber: string;
  orderCode: string;
  battery: number | null;
  channels: ChannelInfo[];
}

export interface RoleState {
  status: ConnStatus;
  kind: ProviderKind | null;
  device?: DeviceInfo;
  error?: string;
  note?: string; // 「이건 일사량 센서예요. 일사량 칸에 연결했어요」 같은 안내
}

export const ROLE_META: Record<Role, { title: string; orderCode: string; unit: string; model: string }> = {
  energy: { title: '에너지 센서', orderCode: 'GDX-NRG', unit: 'V · A', model: 'Go Direct Energy' },
  irradiance: { title: '일사량 센서', orderCode: 'GDX-PYR', unit: 'W/m²', model: 'Go Direct Pyranometer' },
  surfaceTemp: { title: '표면 온도 센서', orderCode: 'GDX-ST', unit: '℃', model: 'Go Direct Surface Temperature' },
};

/** orderCode 로 역할 판별 */
export function roleFromOrderCode(code: string): Role | null {
  const c = (code || '').toUpperCase();
  if (c.includes('NRG')) return 'energy';
  if (c.includes('PYR')) return 'irradiance';
  if (c.includes('ST') && !c.includes('STR')) return 'surfaceTemp';
  return null;
}
