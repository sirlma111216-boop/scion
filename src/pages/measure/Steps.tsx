// 측정 도우미의 준비 / 연결 / 부하 / 마무리 / 확인 측정 / 시설 측정 단계
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Figure } from '../../components/Figure';
import { WarnBox } from '../../components/Helpers';
import { Rich } from '../../components/Rich';
import { ShadowCalc } from '../../components/ShadowCalc';
import { SunCalc, useSunAltitude } from '../../components/SunCalc';
import { measureGuide } from '../../content/sensorsGuide';
import { bestValues, completion } from '../../lib/analysis';
import { fmt } from '../../lib/calc';
import { EXP_KEYS, EXP_META, type Weather } from '../../lib/model';
import { sensors } from '../../sensors/manager';
import { useSensors } from '../../sensors/useSensors';
import { useSession } from '../../state/SessionContext';
import { DemoControls, ManualInputs } from './Inputs';
import { LiveTiles } from './LiveTiles';
import { SensorCards } from './SensorCards';
import { useMeasurement } from './useMeasurement';

export function StepPrepare() {
  const { session, update, settings } = useSession();
  const w = session.weather;
  const setW = (p: Partial<Weather>) => update((s) => ({ ...s, weather: { ...s.weather, ...p } }));
  const check = (k: string, v: boolean) => update((s) => ({ ...s, checklist: { ...s.checklist, [k]: v } }));
  const supplies = measureGuide.supplies.map((s) => (s.startsWith('수직 막대') ? `수직 막대(높이 ${settings.pinHeightCm} cm)와 자` : s));
  return (
    <div className="stack">
      <div className="todo">지금 할 일: 날씨를 적고, 준비물을 확인하고, 안전 수칙을 읽어요.</div>
      <div className="grid-2">
        <div className="card">
          <h4>🌤 오늘의 날씨 (이 기기에 저장)</h4>
          <div className="form-grid">
            <label className="field">
              날짜
              <input type="date" value={w.date} onChange={(e) => setW({ date: e.target.value })} />
            </label>
            <label className="field">
              장소
              <input value={w.place} placeholder={settings.place} onChange={(e) => setW({ place: e.target.value })} />
            </label>
            <label className="field">
              하늘 상태
              <select value={w.sky} onChange={(e) => setW({ sky: e.target.value as Weather['sky'] })}>
                <option value="">선택</option>
                <option>맑음</option>
                <option>구름 조금</option>
                <option>구름 많음</option>
              </select>
            </label>
            <label className="field">
              기온 (℃)
              <input type="number" step="0.1" inputMode="decimal" value={w.tempC} onChange={(e) => setW({ tempC: e.target.value })} />
            </label>
            <label className="field">
              습도 (%)
              <input type="number" inputMode="decimal" value={w.humidity} onChange={(e) => setW({ humidity: e.target.value })} />
            </label>
            <label className="field">
              바람 (m/s)
              <input type="number" step="0.1" inputMode="decimal" value={w.wind} onChange={(e) => setW({ wind: e.target.value })} />
            </label>
            <label className="field">
              일강수 (mm)
              <input type="number" step="0.1" inputMode="decimal" value={w.rain} onChange={(e) => setW({ rain: e.target.value })} />
            </label>
          </div>
          <p className="small" style={{ marginTop: 8 }}>
            <a href="https://www.weather.go.kr" target="_blank" rel="noreferrer">
              기상청 날씨누리에서 확인 ↗
            </a>{' '}
            <span className="muted">— 이 값은 특이사항 문구와 활동 4-과정 3에 쓰여요.</span>
          </p>
        </div>
        <div className="stack">
          <SunCalc compact />
          <div className="card soft" style={{ padding: 16 }}>
            <h4>⏰ 좋은 측정 조건</h4>
            <p style={{ margin: 0 }}>{measureGuide.goodTime}</p>
          </div>
          <div className="card soft" style={{ padding: 16 }}>
            <h4>👥 역할 확인</h4>
            <ul style={{ margin: 0 }}>
              {settings.roles.map((r, i) => (
                <li key={r}>
                  <b>{r}</b> — {settings.team[i]}
                </li>
              ))}
            </ul>
            <Figure slot="gen/team-roles.png" caption="설치 · 측정 · 입력 · 관리 네 가지 역할" ratio="16:9" />
          </div>
        </div>
      </div>
      <div className="card">
        <h4>🎒 준비물 점검표</h4>
        <ul className="checklist">
          {supplies.map((s) => (
            <li key={s}>
              <label>
                <input type="checkbox" checked={!!session.checklist[s]} onChange={(e) => check(s, e.target.checked)} /> {s}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <WarnBox title="안전">
        <ul style={{ margin: 0 }}>
          {measureGuide.safety.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </WarnBox>
    </div>
  );
}

export function StepConnect() {
  const { roles } = useSensors();
  const all = sensors.allConnected();
  return (
    <div className="stack">
      <div className="todo">지금 할 일: 센서 3개를 연결하고, 사진처럼 설치해요.</div>
      <SensorCards />
      <ManualInputs />
      <DemoControls />
      {all ? <div className="alert ok">✅ 준비 완료 — 세 센서의 값이 모두 들어와요. 「부하」 단계로 가세요.</div> : <div className="alert info">세 센서의 실시간 값이 모두 들어오면 「준비 완료」가 떠요. (연결됨: {Object.values(roles).filter((r) => r.status === 'connected').length}/3)</div>}
      <div className="card">
        <h4>🔧 설치 안내</h4>
        <ol>
          {measureGuide.setup.map((s, i) => (
            <li key={i}>
              <Rich text={s} />
            </li>
          ))}
        </ol>
        <div className="grid-2">
          <Figure slot="photo/setup-overview.jpg" caption="우리 장비를 모두 설치한 모습(예시 이미지) — 독서대 위 판에 태양 전지·일사량 센서·수직 막대, 그늘 상자 안에 태블릿, 에너지 센서와 가변 저항" />
          <Figure slot="photo/energy-wiring.jpg" caption="에너지 센서 연결과 Load 스위치(예시 이미지) — 빨간 집게는 (+), 검은 집게는 (−). SOURCE 단자에 태양 전지, LOAD 단자에 부하" />
        </div>
        <LiveTiles />
      </div>
    </div>
  );
}

export function StepLoad() {
  const { session, update } = useSession();
  const { latest } = useSensors();
  const [maxP, setMaxP] = useState(0);
  const [kind, setKind] = useState<'internal' | 'external'>(session.load?.kind ?? 'internal');
  useEffect(() => {
    if (latest.P !== undefined && latest.P > maxP) setMaxP(latest.P);
  }, [latest.P, maxP]);
  const internalOver = kind === 'internal' && ((latest.V ?? 0) > 5 || (latest.I ?? 0) >= 0.17);
  const fix = () => {
    const R = latest.V && latest.I ? latest.V / latest.I : undefined;
    update((s) => ({ ...s, load: { kind, V: latest.V, I: latest.I, P: latest.P, R, t: Date.now() } }));
  };
  const fixInternal = () => update((s) => ({ ...s, load: { kind: 'internal', R: 30, t: Date.now() } }));
  return (
    <div className="stack">
      <div className="todo">지금 할 일: 부하를 정하고, 실험이 끝날 때까지 바꾸지 않아요. (한 번만)</div>
      <div className="helper easy" style={{ marginTop: 0 }}>
        <div className="h">
          <span>💡</span> 왜 부하를 정하나요?
        </div>
        <Rich text={measureGuide.load.intro} />
      </div>
      <div className="row">
        <button type="button" className={`btn big ${kind === 'internal' ? 'primary' : ''}`} onClick={() => setKind('internal')}>
          (가) 센서 내부 30 Ω 사용
        </button>
        <button type="button" className={`btn big ${kind === 'external' ? 'primary' : ''}`} onClick={() => setKind('external')}>
          (나) 외부 부하(가변 저항) 사용
        </button>
      </div>
      <ManualInputs />
      <DemoControls />
      {kind === 'internal' ? (
        <div className="card">
          <p>에너지 센서의 Load 스위치를 「Internal 30 Ω Load」에 두세요. (SOURCE/LOAD 단자형 센서는 내부 부하가 없어요 → (나)를 고르세요.)</p>
          <LiveTiles manip="none" />
          {internalOver && <div className="alert warn">{measureGuide.load.internalWarn} (전압 5 V 또는 전류 0.18 A에 가까워요)</div>}
          <button type="button" className="btn primary big" onClick={fixInternal}>
            내부 30 Ω으로 기록
          </button>
        </div>
      ) : (
        <div className="card">
          <h4>최대 전력 찾기 (기본 자세 90°에서)</h4>
          <Rich text={measureGuide.load.external} />
          <div style={{ marginTop: 12 }}>
            <LiveTiles manip="none" bigPower />
          </div>
          <div className="row" style={{ margin: '8px 0' }}>
            <span>
              지금까지 최댓값: <b className="num" style={{ fontSize: 24 }}>{fmt(maxP, 3)} W</b>
            </span>
            {latest.P !== undefined && maxP > 0 && <span className="badge blue">지금은 최댓값의 {Math.round((latest.P / maxP) * 100)}%</span>}
            <button type="button" className="btn sm" onClick={() => setMaxP(0)}>
              최댓값 다시 찾기
            </button>
          </div>
          <button type="button" className="btn primary big" disabled={latest.V === undefined} onClick={fix}>
            이 값으로 고정
          </button>
        </div>
      )}
      {session.load && (
        <div className="alert ok">
          기록된 부하: {session.load.kind === 'internal' ? '내부 30 Ω' : `외부 부하 약 ${session.load.R ? session.load.R.toFixed(1) : '?'} Ω`}
          {session.load.V !== undefined && ` (전압 ${fmt(session.load.V, 2)} V · 전류 ${fmt(session.load.I, 3)} A · 전력 ${fmt(session.load.P, 3)} W)`} — 이제 손잡이를 건드리지 마세요. 이 정보는 모든 특이사항과 결과 정리에 표시돼요.
        </div>
      )}
    </div>
  );
}

export function StepFinish({ goto }: { goto: (n: number) => void }) {
  const { session, update } = useSession();
  const comp = completion(session);
  const check = (k: string, v: boolean) => update((s) => ({ ...s, checklist: { ...s.checklist, [k]: v } }));
  return (
    <div className="stack">
      <div className="todo">지금 할 일: 빠진 회차가 없는지 보고, 센서를 정리해요.</div>
      <div className="grid-3">
        {EXP_KEYS.map((k, i) => (
          <div key={k} className="card" style={{ padding: 16 }}>
            <h4>{EXP_META[k].title}</h4>
            <div className="num" style={{ fontSize: 28 }}>
              {comp[k].done} / {comp[k].conds} 조건 완료
            </div>
            {comp[k].missing.length > 0 ? (
              <>
                <ul className="small" style={{ margin: '6px 0' }}>
                  {comp[k].missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <button type="button" className="btn sm" onClick={() => goto(3 + i)}>
                  이 실험으로
                </button>
              </>
            ) : (
              <div className="alert ok">모두 3회씩 ✓</div>
            )}
          </div>
        ))}
      </div>
      <div className="row">
        <Link className="btn primary big" to="/results">
          📋 결과 정리로 가기
        </Link>
        <button type="button" className="btn big" onClick={() => goto(7)}>
          ✅ 확인 측정
        </button>
        <button type="button" className="btn big" onClick={() => goto(8)}>
          🏢 시설 측정
        </button>
      </div>
      <div className="card">
        <h4>🧹 센서 끄기·정리</h4>
        <ul className="checklist">
          {measureGuide.finish.map((s) => (
            <li key={s}>
              <label>
                <input type="checkbox" checked={!!session.checklist[`finish:${s}`]} onChange={(e) => check(`finish:${s}`, e.target.checked)} /> {s}
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="btn" onClick={() => sensors.disconnectAll()}>
          모든 센서 연결 끊기
        </button>
      </div>
    </div>
  );
}

export function StepConfirm() {
  const { session, update } = useSession();
  const { state, measure, cancel } = useMeasurement();
  const { roles } = useSensors();
  const best = bestValues(session);
  const run = async () => {
    const t = await measure();
    if (t) update((s) => ({ ...s, confirm: t }));
  };
  return (
    <div className="stack">
      <div className="todo">확인 측정: 세 실험에서 찾은 가장 좋은 조건을 한꺼번에 만들고 1회 재요. (활동 4-과정 1-3번)</div>
      <div className="card soft">
        <h4>가장 좋은 조건으로 맞추기</h4>
        <ul>
          <li>가림막 0겹 (일사량 가장 큼{best.irr && ` — 실험에서는 ${best.irr} W/m²`})</li>
          <li>각도 {best.angle || 90}° (막대 그림자가 없게)</li>
          <li>차갑게 (얼음팩으로 식힌 직후{best.temp && ` — 실험에서는 ${best.temp} ℃`})</li>
        </ul>
      </div>
      <ManualInputs />
      <DemoControls preset={{ layers: 0, angleDeg: 90, T: 12, label: '가장 좋은 조건' }} />
      <LiveTiles />
      <div className="card">
        {state.running ? (
          <div>
            <b>측정 중… {state.remainingSec}초</b>{' '}
            <button type="button" className="btn sm" onClick={cancel}>
              취소
            </button>
            <div className="progress" style={{ marginTop: 8 }}>
              <div style={{ width: `${state.progress * 100}%` }} />
            </div>
          </div>
        ) : (
          <button type="button" className="btn primary huge block" disabled={roles.energy.status !== 'connected'} onClick={run}>
            확인 측정 (1회)
          </button>
        )}
        {state.error && <div className="alert warn">{state.error}</div>}
        {session.confirm && (
          <div className="alert ok">
            기록: 전압 {fmt(session.confirm.V, 2)} V · 전류 {fmt(session.confirm.I, 3)} A · 전력 <b>{fmt(session.confirm.P, 3)} W</b>
            {session.confirm.G !== undefined && ` · 일사량 ${fmt(session.confirm.G, 0)} W/m²`}
            {session.confirm.T !== undefined && ` · 온도 ${fmt(session.confirm.T, 1)} ℃`}
          </div>
        )}
      </div>
    </div>
  );
}

export function StepFacility() {
  const { session, update, settings } = useSession();
  const { latest, roles } = useSensors();
  const sunAlt = useSunAltitude();
  const f = session.facility ?? { place: '' };
  const [tilt, setTilt] = useState('');
  const [angleMode, setAngleMode] = useState<'shadow' | 'tilt'>('shadow');
  const [tempMode, setTempMode] = useState<'sensor' | 'air'>('sensor');
  const [air, setAir] = useState(session.weather.tempC);
  const set = (p: Partial<typeof f>) => update((s) => ({ ...s, facility: { ...(s.facility ?? { place: '' }), ...p } }));
  const tiltAngle = tilt ? Math.min(90, Math.max(0, parseFloat(tilt) + sunAlt)) : undefined;
  const recordAll = () => {
    set({
      G: latest.G,
      angle: angleMode === 'tilt' ? tiltAngle : f.angle,
      T: tempMode === 'sensor' ? latest.T : air ? parseFloat(air) : undefined,
      tempNote: tempMode === 'air' ? '기온으로 대신함' : undefined,
      t: Date.now(),
    });
  };
  return (
    <div className="stack">
      <div className="todo">시설 측정: 방문한 태양광 시설에서 일사량·각도·온도를 한 번 기록해요. (활동 4-과정 3-2번)</div>
      <WarnBox>전기 설비예요. 전선·단자함은 만지지 않아요. 옥상에서는 선생님과 함께.</WarnBox>
      <div className="card">
        <label className="field">
          방문 장소 이름
          <input value={f.place} onChange={(e) => set({ place: e.target.value })} placeholder="예: ○○ 옥상 태양광 발전 설비" />
        </label>
      </div>
      <ManualInputs />
      <DemoControls />
      <div className="grid-3">
        <div className="card" style={{ padding: 16 }}>
          <h4>☀️ 일사량</h4>
          <p className="small">일사량 센서를 시설의 패널과 <b>같은 기울기</b>로 대고 재요.</p>
          <div className="num" style={{ fontSize: 32 }}>
            {fmt(latest.G, 0)} <span className="small muted">W/m²</span>
          </div>
          {roles.irradiance.status !== 'connected' && <div className="tiny muted">일사량 센서를 연결하거나 직접 입력 모드를 쓰세요.</div>}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h4>📐 태양 빛과 패널의 각</h4>
          <div className="row" style={{ marginBottom: 8 }}>
            <button type="button" className={`btn sm ${angleMode === 'shadow' ? 'primary' : ''}`} onClick={() => setAngleMode('shadow')}>
              그림자 계산기
            </button>
            <button type="button" className={`btn sm ${angleMode === 'tilt' ? 'primary' : ''}`} onClick={() => setAngleMode('tilt')}>
              패널 기울기 + 태양 고도
            </button>
          </div>
          {angleMode === 'shadow' ? (
            <ShadowCalc pinHeightCm={settings.pinHeightCm} targets={[90, 60, 45, 30]} onMeasured={(deg) => set({ angle: deg })} />
          ) : (
            <div>
              <label className="field">
                패널이 땅과 이루는 기울기(°) — 각도기 앱으로
                <input type="number" inputMode="decimal" value={tilt} onChange={(e) => setTilt(e.target.value)} />
              </label>
              <p className="small">
                지금 태양 고도 약 {Math.round(sunAlt)}° → 패널이 태양 쪽을 향해 있을 때 각 ≈ <b className="num">{tiltAngle !== undefined ? Math.round(tiltAngle) : '–'}°</b>
              </p>
            </div>
          )}
          {f.angle !== undefined && <div className="alert ok">기록된 각: {Math.round(f.angle)}°</div>}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h4>🌡 온도</h4>
          <div className="row" style={{ marginBottom: 8 }}>
            <button type="button" className={`btn sm ${tempMode === 'sensor' ? 'primary' : ''}`} onClick={() => setTempMode('sensor')}>
              표면 온도 센서
            </button>
            <button type="button" className={`btn sm ${tempMode === 'air' ? 'primary' : ''}`} onClick={() => setTempMode('air')}>
              기온으로 대신
            </button>
          </div>
          {tempMode === 'sensor' ? (
            <div className="num" style={{ fontSize: 32 }}>
              {fmt(latest.T, 1)} <span className="small muted">℃</span>
            </div>
          ) : (
            <label className="field">
              그때의 기온(℃)
              <input type="number" step="0.1" inputMode="decimal" value={air} onChange={(e) => setAir(e.target.value)} />
            </label>
          )}
          <p className="tiny muted">패널 틀이나 뒷면에 대요. 닿을 수 없으면 기온을 적고 특이사항에 ‘기온으로 대신함’이라고 써요.</p>
        </div>
      </div>
      <button type="button" className="btn primary big" onClick={recordAll}>
        지금 값으로 시설 측정 기록
      </button>
      {f.t && (
        <div className="alert ok">
          기록됨 ({new Date(f.t).toLocaleString('ko-KR')}): {f.place || '(장소 없음)'} · 일사량 {fmt(f.G, 0)} W/m² · 각 {f.angle !== undefined ? Math.round(f.angle) : '–'}° · 온도 {fmt(f.T, 1)} ℃{f.tempNote && ` (${f.tempNote})`} →{' '}
          <Link to="/my/4/3">활동 4-과정 3에서 보기</Link>
        </div>
      )}
    </div>
  );
}
