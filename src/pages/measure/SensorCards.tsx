// 연결 화면(6-3): 센서 카드 3장
import { fmt } from '../../lib/calc';
import { sensors } from '../../sensors/manager';
import { ROLES, ROLE_META, type Role } from '../../sensors/types';
import { useSensors } from '../../sensors/useSensors';
import { useSession } from '../../state/SessionContext';

const STATUS: Record<string, string> = { disconnected: '연결 안 됨', connecting: '연결 중…', connected: '연결됨', lost: '끊김' };

export function SensorCards() {
  const { roles, latest } = useSensors();
  const { demo, setDemo, update } = useSession();
  const hasBt = typeof navigator !== 'undefined' && !!navigator.bluetooth;
  const startDemo = async () => {
    if (!demo) {
      setDemo(true); // 연습 세션(scion:demo)으로 바꾼다
      update((s) => ({ ...s, step: 1 })); // 바뀐 세션에서도 「연결」 단계에 머문다
    }
    await sensors.connectDemoAll();
  };
  const value = (r: Role) => {
    if (r === 'energy') return latest.V === undefined ? '–' : `${fmt(latest.V, 2)} V · ${fmt(latest.I, 3)} A`;
    if (r === 'irradiance') return latest.G === undefined ? '–' : `${fmt(latest.G, 0)} W/m²`;
    return latest.T === undefined ? '–' : `${fmt(latest.T, 1)} ℃`;
  };
  return (
    <div>
      {!hasBt && (
        <div className="alert warn">
          이 브라우저는 블루투스 연결이 안 돼요. 윈도우 노트북·크롬북·안드로이드 태블릿의 <b>크롬</b>으로 열어 주세요. 아이패드·아이폰은 안 돼요. 대신 「직접 입력 모드」나 「연습 모드」를 쓸 수 있어요.
        </div>
      )}
      <div className="helper data" style={{ marginTop: 0 }}>
        <div className="h">
          <span>🔵</span> 연결 전에
        </div>
        <ol style={{ margin: 0 }}>
          <li>센서 전원 버튼을 눌러 <b>빨간 불이 깜박이는지</b> 확인해요.</li>
          <li>
            「블루투스로 연결」을 누르면 뜨는 창에서 <b>내 센서 이름표의 번호와 같은 것</b>을 골라요. (예: GDX-NRG 0K1000A1)
          </li>
          <li>
            <b>초록 불이 깜박이면</b> 성공이에요.
          </li>
        </ol>
      </div>
      <div className="grid-3">
        {ROLES.map((r) => {
          const s = roles[r];
          const connected = s.status === 'connected';
          return (
            <div key={r} className="sensor-card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="st">{ROLE_META[r].title}</span>
                <span className={`badge ${connected ? 'green' : s.status === 'lost' ? 'red' : ''}`}>
                  {connected ? '● ' : s.status === 'lost' ? '✕ ' : '○ '}
                  {STATUS[s.status]}
                  {s.kind === 'manual' && ' · 직접 입력'}
                  {s.kind === 'demo' && ' · 연습'}
                </span>
              </div>
              <div className="tiny muted">
                {ROLE_META[r].model} ({ROLE_META[r].orderCode})
                {s.device && (
                  <>
                    {' '}
                    · {s.device.name} {s.device.serialNumber && `#${s.device.serialNumber}`}
                    {s.device.battery !== null && s.device.battery !== undefined && (
                      <span className={s.device.battery < 20 ? 'badge red' : 'badge'} style={{ marginLeft: 6 }}>
                        🔋 {s.device.battery}%{s.device.battery < 20 && ' 충전하세요'}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="cur">{value(r)}</div>
              {s.note && <div className="alert info">{s.note}</div>}
              {s.error && <div className="alert warn">{s.error}</div>}
              {s.status === 'lost' && <div className="alert warn">센서가 끊겼어요. 이미 기록된 값은 그대로예요. 다시 연결하세요.</div>}
              <div className="btns">
                {!connected ? (
                  <>
                    <button type="button" className="btn primary" disabled={!hasBt || s.status === 'connecting'} onClick={() => sensors.connectGodirect(r)}>
                      {s.status === 'lost' ? '🔄 다시 연결' : '블루투스로 연결'}
                    </button>
                    <button type="button" className="btn" onClick={() => sensors.connectGodirect(r, true)}>
                      USB로 연결
                    </button>
                    <button type="button" className="btn outline" onClick={() => sensors.connectManual(r)}>
                      직접 입력 모드
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn danger" onClick={() => sensors.disconnect(r)}>
                    연결 끊기
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button type="button" className="btn big" style={{ background: '#ffe9a8', color: '#5a4300' }} onClick={startDemo}>
          🎮 연습 모드로 세 센서 모두 연결 (가상 값)
        </button>
        <span className="small muted">교실에서 미리 연습할 때 써요. 연습 값은 실제 기록과 완전히 따로 저장돼요.</span>
      </div>
    </div>
  );
}
