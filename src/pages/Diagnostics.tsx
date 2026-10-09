import { CopyButton } from '../components/CopyButton';
import { sensors } from '../sensors/manager';
import { ROLES, ROLE_META } from '../sensors/types';
import { useSensors } from '../sensors/useSensors';

/** 센서 진단(6-6): 연결된 기기마다 모든 채널을 표로. 교사가 첫 연결 때 확인. */
export function Diagnostics() {
  const { roles } = useSensors();
  const hasBt = typeof navigator !== 'undefined' && !!navigator.bluetooth;
  const report = ROLES.map((r) => {
    const s = roles[r];
    const d = s.device;
    const lines = [`[${ROLE_META[r].title}] 상태=${s.status} 방식=${s.kind ?? '-'}`];
    if (d) {
      lines.push(`  name=${d.name} serial=${d.serialNumber} orderCode=${d.orderCode} battery=${d.battery ?? '-'}%`);
      for (const c of d.channels) lines.push(`  ch${c.number} ${c.name} [${c.unit}] enabled=${c.enabled} value=${c.value ?? '-'}`);
    }
    return lines.join('\n');
  }).join('\n');
  const env = `브라우저: ${navigator.userAgent}\nWeb Bluetooth: ${hasBt ? '있음' : '없음'}\n시각: ${new Date().toISOString()}`;
  return (
    <div className="stack">
      <div>
        <h1>센서 진단</h1>
        <p className="muted">연결된 기기의 이름·일련번호·orderCode·배터리와 모든 채널(번호·이름·단위·켜짐·현재 값)을 보여 줘요. 문제가 생기면 「이 내용 복사」로 붙여 넣어 문의하세요.</p>
      </div>
      {!hasBt && <div className="alert warn">이 브라우저에는 Web Bluetooth가 없어요. 윈도우·크롬북·안드로이드의 크롬으로 열어 주세요.</div>}
      <div className="grid-3">
        {ROLES.map((r) => {
          const s = roles[r];
          return (
            <div key={r} className="sensor-card">
              <div className="st">
                {ROLE_META[r].title} <span className="badge">{ROLE_META[r].orderCode}</span>
              </div>
              <div className="small muted">상태: {s.status} · 방식: {s.kind ?? '-'}</div>
              <div className="btns">
                <button type="button" className="btn primary" disabled={!hasBt} onClick={() => sensors.connectGodirect(r)}>
                  블루투스 연결
                </button>
                <button type="button" className="btn" onClick={() => sensors.connectGodirect(r, true)}>
                  USB 연결
                </button>
                {s.status === 'connected' && (
                  <button type="button" className="btn danger" onClick={() => sensors.disconnect(r)}>
                    끊기
                  </button>
                )}
              </div>
              {s.error && <div className="alert warn">{s.error}</div>}
              {s.device && (
                <div style={{ marginTop: 10 }}>
                  <dl className="kv">
                    <dt>name</dt>
                    <dd>{s.device.name}</dd>
                    <dt>serial</dt>
                    <dd>{s.device.serialNumber}</dd>
                    <dt>orderCode</dt>
                    <dd>{s.device.orderCode}</dd>
                    <dt>battery</dt>
                    <dd>{s.device.battery ?? '-'}%</dd>
                  </dl>
                  <table className="plain-table" style={{ marginTop: 8 }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>이름</th>
                        <th>단위</th>
                        <th>켜짐</th>
                        <th>값</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.device.channels.map((c) => (
                        <tr key={c.number}>
                          <td>{c.number}</td>
                          <td>{c.name}</td>
                          <td>{c.unit}</td>
                          <td>{c.enabled ? '✓' : ''}</td>
                          <td className="num">{c.value ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {s.note && <div className="alert info">{s.note}</div>}
                  <ChannelPicker role={r} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="card soft">
        <h4>진단 보고</h4>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
          {env}
          {'\n'}
          {report}
        </pre>
        <CopyButton text={`${env}\n${report}`} label="이 내용 복사" />
      </div>
    </div>
  );
}

/** 자동 판별 실패 시 채널 직접 선택 */
function ChannelPicker({ role }: { role: (typeof ROLES)[number] }) {
  const { roles } = useSensors();
  const d = roles[role].device;
  if (!d || roles[role].kind !== 'godirect') return null;
  return (
    <details>
      <summary>채널 직접 고르기</summary>
      <p className="tiny muted">자동 판별이 안 될 때만 쓰세요. 에너지 센서는 전압(V)과 전류(mA) 두 채널을 고르세요.</p>
      <div className="row">
        {d.channels.map((c) => (
          <label key={c.number} className="check small">
            <input
              type="checkbox"
              checked={c.enabled}
              onChange={(e) => {
                const nums = d.channels.filter((x) => (x.number === c.number ? e.target.checked : x.enabled)).map((x) => x.number);
                sensors.godirect.enableChannels(role, nums);
              }}
            />
            ch{c.number} {c.name} [{c.unit}]
          </label>
        ))}
      </div>
    </details>
  );
}
