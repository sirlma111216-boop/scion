import { useState } from 'react';
import { angleFromShadow, fmtShadow, shadowLength } from '../lib/shadow';

/** 그림자 길이 계산기(5-4 4번, 7-5). 막대 높이 → 목표 각도별 그림자 길이 표, 그림자 길이 → 실제 각도 */
export function ShadowCalc({ pinHeightCm, onPinChange, targets = [90, 60, 45, 30, 0], onMeasured }: { pinHeightCm: number; onPinChange?: (h: number) => void; targets?: number[]; onMeasured?: (deg: number) => void }) {
  const [shadow, setShadow] = useState('');
  const s = parseFloat(shadow);
  const measured = Number.isFinite(s) && s >= 0 ? angleFromShadow(pinHeightCm, s) : null;
  return (
    <div className="card soft" style={{ padding: 16 }}>
      <h4>📏 그림자 길이 계산기</h4>
      <div className="form-grid">
        <label className="field">
          막대 높이 h (cm)
          <input type="number" step="0.1" min="0.5" value={pinHeightCm} onChange={(e) => onPinChange?.(parseFloat(e.target.value) || 5)} readOnly={!onPinChange} />
        </label>
        <label className="field">
          잰 그림자 길이 L (cm) → 실제 각도
          <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="예: 2.9" value={shadow} onChange={(e) => setShadow(e.target.value)} />
        </label>
      </div>
      <table className="plain-table" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>목표 각도</th>
            <th>그림자 길이 (h = {pinHeightCm} cm)</th>
          </tr>
        </thead>
        <tbody>
          {targets.map((a) => (
            <tr key={a}>
              <td className="num">{a}°</td>
              <td className="num">{fmtShadow(shadowLength(pinHeightCm, a))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {measured !== null && (
        <div className="alert info" style={{ marginTop: 10 }}>
          그림자 {s.toFixed(1)} cm → 실제 각도 약 <b className="num">{measured.toFixed(1)}°</b>
          {onMeasured && (
            <button type="button" className="btn sm primary" style={{ marginLeft: 10 }} onClick={() => onMeasured(Math.round(measured * 10) / 10)}>
              이 값을 조건값으로
            </button>
          )}
        </div>
      )}
      <p className="tiny muted" style={{ margin: '8px 0 0' }}>
        각도 = 태양 빛과 태양 전지 면이 이루는 각. 그림자가 없으면 90°, 그림자가 끝없이 길어지면 0°.
      </p>
    </div>
  );
}
