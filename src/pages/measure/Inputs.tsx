// 직접 입력 모드의 입력 칸과 연습 모드의 슬라이더
import { useState } from 'react';
import { sensors } from '../../sensors/manager';
import { useSensors } from '../../sensors/useSensors';

export function ManualInputs() {
  const { roles } = useSensors();
  const [v, setV] = useState({ V: '', mA: '', G: '', T: '' });
  const anyManual = Object.values(roles).some((r) => r.kind === 'manual');
  if (!anyManual) return null;
  const upd = (k: keyof typeof v, val: string) => {
    const next = { ...v, [k]: val };
    setV(next);
    const num = (s: string) => (s.trim() === '' ? undefined : parseFloat(s));
    sensors.manual.set({ V: num(next.V), I: num(next.mA) === undefined ? undefined : (num(next.mA) as number) / 1000, G: num(next.G), T: num(next.T) });
  };
  return (
    <div className="card soft" style={{ padding: 14 }}>
      <h4>✍️ 직접 입력 (Graphical Analysis 등 다른 화면의 값을 읽어 적어요)</h4>
      <div className="manual-inputs form-grid">
        {roles.energy.kind === 'manual' && (
          <>
            <label>
              전압 (V)
              <input type="number" step="0.01" inputMode="decimal" value={v.V} onChange={(e) => upd('V', e.target.value)} />
            </label>
            <label>
              전류 (mA) — 앱이 A로 바꿔요
              <input type="number" step="1" inputMode="decimal" value={v.mA} onChange={(e) => upd('mA', e.target.value)} />
            </label>
          </>
        )}
        {roles.irradiance.kind === 'manual' && (
          <label>
            일사량 (W/m²)
            <input type="number" step="1" inputMode="decimal" value={v.G} onChange={(e) => upd('G', e.target.value)} />
          </label>
        )}
        {roles.surfaceTemp.kind === 'manual' && (
          <label>
            표면 온도 (℃)
            <input type="number" step="0.1" inputMode="decimal" value={v.T} onChange={(e) => upd('T', e.target.value)} />
          </label>
        )}
      </div>
      <p className="tiny muted" style={{ margin: '6px 0 0' }}>
        값을 적은 뒤 「측정」을 누르면 5초 동안 이 값이 기록돼요. 회차마다 새 값을 읽어 고쳐 적어요.
      </p>
    </div>
  );
}

export function DemoControls({ preset }: { preset?: { layers?: number; angleDeg?: number; T?: number; label?: string } }) {
  const { roles } = useSensors();
  const [, force] = useState(0);
  const anyDemo = Object.values(roles).some((r) => r.kind === 'demo');
  if (!anyDemo) return null;
  const st = sensors.demo.state;
  const set = (p: Partial<typeof st>) => {
    sensors.demo.set(p);
    force((x) => x + 1);
  };
  return (
    <div className="card" style={{ padding: 14, background: '#fffbea', borderColor: '#f1dd8a' }}>
      <h4>🎮 연습 모드 — 가상 센서 조절</h4>
      <div className="form-grid">
        <label className="slider">
          햇빛 세기 {Math.round(st.G)} W/m²
          <input type="range" min={100} max={1100} step={10} value={st.G} onChange={(e) => set({ G: +e.target.value })} />
        </label>
        <label className="slider">
          가림막 {st.layers}겹
          <input type="range" min={0} max={4} step={1} value={st.layers} onChange={(e) => set({ layers: +e.target.value })} />
        </label>
        <label className="slider">
          각도 {st.angleDeg}°
          <input type="range" min={0} max={90} step={5} value={st.angleDeg} onChange={(e) => set({ angleDeg: +e.target.value })} />
        </label>
        <label className="slider">
          표면 온도 {st.T.toFixed(0)} ℃
          <input type="range" min={5} max={70} step={1} value={st.T} onChange={(e) => set({ T: +e.target.value })} />
        </label>
      </div>
      {preset && (
        <button
          type="button"
          className="btn sm dark"
          style={{ marginTop: 8 }}
          onClick={() => set({ layers: preset.layers ?? st.layers, angleDeg: preset.angleDeg ?? st.angleDeg, T: preset.T ?? st.T })}
        >
          이 조건으로 맞추기{preset.label ? ` (${preset.label})` : ''}
        </button>
      )}
    </div>
  );
}
