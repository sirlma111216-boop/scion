import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExpChart } from '../../components/Charts';
import { CopyButton } from '../../components/CopyButton';
import { DataSentences } from '../../components/DataSentences';
import { Figure } from '../../components/Figure';
import { DataBox, EasyCard, ExampleBox, ExampleNotice, WarnBox } from '../../components/Helpers';
import { OnDropdown, OnFrame, OnInput, OnQ, OnSaveButton } from '../../components/On';
import { Rich } from '../../components/Rich';
import { act4p1, act4p2, act4p3 } from '../../content/act4';
import { bestValues } from '../../lib/analysis';
import { fmt } from '../../lib/calc';
import { EXP_KEYS } from '../../lib/model';
import { SURVEY_KEY, loadJson, saveJson } from '../../lib/storage';
import { useSession } from '../../state/SessionContext';
import { ProcessNav } from './ProcessNav';

const NAV = [
  { to: '/my/4/1', label: '과정 1' },
  { to: '/my/4/2', label: '과정 2' },
  { to: '/my/4/3', label: '과정 3' },
];

export function Act4P1() {
  const c = act4p1;
  const { session, demo } = useSession();
  const best = bestValues(session);
  const hasAny = EXP_KEYS.some((k) => session.experiments[k].conditions.some((x) => x.trials.length));
  return (
    <OnFrame path="/my/4/1" section="탐구수행" activity="활동4. 데이터 분석 및 결론도출">
      <ProcessNav items={NAV} />
      <OnDropdown>{c.dropdown}</OnDropdown>

      <OnQ n={1}>{c.q1.title}</OnQ>
      {demo && <span className="badge yellow">연습 모드 — 가상 값</span>}
      <div style={{ overflowX: 'auto' }}>
        <table className="on-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              {c.q1.heads.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {EXP_KEYS.map((k) => (
                <td key={k}>
                  <ExpChart expKey={k} session={session} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <EasyCard>
        <p style={{ margin: 0 }}>{c.q1.easy}</p>
      </EasyCard>

      <OnQ n={2} sub={c.q2.sub}>
        {c.q2.title}
      </OnQ>
      <table className="on-table">
        <thead>
          <tr>
            {c.q2.heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {EXP_KEYS.map((k) => (
              <td key={k}>
                <OnInput>{best[k] ? <b style={{ color: 'var(--ink)' }}>{best[k]}</b> : ''}</OnInput>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <DataBox title="내 데이터로 채운 값">
        {hasAny ? (
          <p style={{ margin: 0 }}>
            각 실험에서 평균 전력이 가장 큰 조건: 일사량 <b className="num">{best.irr || '–'}</b> W/m² · 각도 <b className="num">{best.angle || '–'}</b>° · 온도{' '}
            <b className="num">{best.temp || '–'}</b> ℃ — 위 표의 상자에 들어간 값이에요.
          </p>
        ) : (
          <p style={{ margin: 0 }}>측정한 뒤에 채워져요.</p>
        )}
      </DataBox>
      <div className="helper example">
        <div className="h">
          <span>🌱</span> 모범 예시
        </div>
        <Rich text={c.q2.example} />
      </div>
      <WarnBox>
        <Rich text={c.q2.warn} />
      </WarnBox>

      <OnQ n={3}>{c.q3.title}</OnQ>
      <div className="row">
        <Link className="btn primary" to="/measure?step=7">
          ✅ 확인 측정 하러 가기
        </Link>
        {session.confirm && (
          <span className="small">
            확인 측정 기록: 전압 {fmt(session.confirm.V, 2)} V · 전류 {fmt(session.confirm.I, 3)} A · 전력 <b>{fmt(session.confirm.P, 3)} W</b>
          </span>
        )}
      </div>

      <OnQ n={4}>{c.q4.title}</OnQ>
      <ExampleNotice />
      <table className="on-table">
        <thead>
          <tr>
            <th style={{ width: 170 }}>조건</th>
            <th>과학적 이유</th>
          </tr>
        </thead>
        <tbody>
          {c.q4.rows.map((r, i) => (
            <tr key={r.cond}>
              <td className="fixed">{r.cond}</td>
              <td>
                <ExampleBox id={i === 0 ? '4-1-4' : undefined} text={r.example} tall />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EasyCard>
        <p>{c.q4.easy}</p>
        <Figure slot="gen/light-angle.png" caption="똑바로 비추면 좁고 밝게, 비스듬히 비추면 넓고 흐리게" ratio="16:9" />
      </EasyCard>
      <DataSentences session={session} />
      <OnSaveButton />
    </OnFrame>
  );
}

interface SurveyRow {
  place: string;
  kw: string;
  date: string;
  addr: string;
}
const emptyRows = (): SurveyRow[] => Array.from({ length: 5 }, () => ({ place: '', kw: '', date: '', addr: '' }));

export function Act4P2() {
  const c = act4p2;
  const [rows, setRows] = useState<SurveyRow[]>(() => loadJson<{ rows: SurveyRow[] }>(SURVEY_KEY, { rows: emptyRows() }).rows);
  const save = (next: SurveyRow[]) => {
    setRows(next);
    saveJson(SURVEY_KEY, { rows: next });
  };
  const text = rows
    .filter((r) => r.place || r.kw || r.addr)
    .map((r) => `${r.place}\t${r.kw}\t${r.date}\t${r.addr}`)
    .join('\n');
  return (
    <OnFrame path="/my/4/2" section="탐구수행" activity="활동4. 데이터 분석 및 결론도출">
      <ProcessNav items={NAV} />
      <OnDropdown>{c.dropdown}</OnDropdown>
      <OnQ n={1} sub={c.q1.sub}>
        {c.q1.title}
      </OnQ>
      <div style={{ overflowX: 'auto' }}>
        <table className="on-table" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th rowSpan={2}>위치</th>
              <th colSpan={3}>태양광 발전 설비 현황</th>
            </tr>
            <tr>
              <th>설치용량(kW)</th>
              <th>설치시기</th>
              <th>주소</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i}>
                <td>
                  <OnInput />
                </td>
                <td>
                  <OnInput />
                </td>
                <td>
                  <OnInput placeholder="📅 달력 선택" />
                </td>
                <td>
                  <OnInput />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">※ 최대 5개까지 추가할 수 있습니다.</p>
      {c.q1.foot.map((f) => (
        <p key={f} className="small muted" style={{ margin: '2px 0' }}>
          {f}
        </p>
      ))}
      <EasyCard title={c.q1.easyTitle}>
        <ol>
          <li>{c.q1.easy[0]}</li>
          <li>
            {c.q1.easy[1]}
            <ul>
              {c.q1.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li>{c.q1.easy[2]}</li>
          <li>{c.q1.easy[3]}</li>
        </ol>
        <p style={{ margin: 0 }}>{c.q1.easyTail}</p>
      </EasyCard>
      <div className="helper example">
        <div className="h">
          <span>🌱</span> 모범 예시 <span className="small muted">({c.q1.exampleNote})</span>
        </div>
        <table className="plain-table" style={{ background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr>
              {c.q1.heads.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.q1.exampleRows.map((r, i) => (
              <tr key={i}>
                {r.map((x, j) => (
                  <td key={j}>{x}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DataBox title="조사 기록장 (이 기기에 저장돼요 · ON에 옮겨 적기 전 초안용)">
        <table className="plain-table" style={{ background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr>
              {c.q1.heads.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {(['place', 'kw', 'date', 'addr'] as (keyof SurveyRow)[]).map((k) => (
                  <td key={k} style={{ padding: 4 }}>
                    <input
                      className="on-input"
                      style={{ width: '100%', color: 'var(--ink)' }}
                      type={k === 'date' ? 'date' : 'text'}
                      value={r[k]}
                      onChange={(e) => save(rows.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row" style={{ marginTop: 8 }}>
          <CopyButton text={text} label="기록 복사" />
          <button type="button" className="btn sm danger" onClick={() => confirm('조사 기록장을 비울까요?') && save(emptyRows())}>
            비우기
          </button>
        </div>
      </DataBox>
      <OnQ n={2}>{c.q2.title}</OnQ>
      <EasyCard>
        <p style={{ margin: 0 }}>{c.q2.easy}</p>
      </EasyCard>
      <OnSaveButton />
    </OnFrame>
  );
}

export function Act4P3() {
  const c = act4p3;
  const { session } = useSession();
  const best = bestValues(session);
  const w = session.weather;
  const hasWeather = w.tempC || w.wind || w.humidity || w.rain;
  const f = session.facility;
  return (
    <OnFrame path="/my/4/3" section="탐구수행" activity="활동4. 데이터 분석 및 결론도출">
      <ProcessNav items={NAV} />
      <OnDropdown>{c.dropdown}</OnDropdown>

      <OnQ n={1} sub={c.q1.sub}>
        {c.q1.title}
      </OnQ>
      <div style={{ overflowX: 'auto' }}>
        <table className="on-table" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th rowSpan={2}>위치</th>
              <th colSpan={4}>기상조건</th>
            </tr>
            <tr>
              {c.q1.heads.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <OnInput placeholder="활동 4 > 과정 2 > 1번에서 적은 곳 중 선택 ▾" />
              </td>
              <td>
                <OnInput>{hasWeather && w.tempC ? <b style={{ color: 'var(--ink)' }}>{w.tempC}</b> : ''}</OnInput>
              </td>
              <td>
                <OnInput>{hasWeather && w.wind ? <b style={{ color: 'var(--ink)' }}>{w.wind}</b> : ''}</OnInput>
              </td>
              <td>
                <OnInput>{hasWeather && w.humidity ? <b style={{ color: 'var(--ink)' }}>{w.humidity}</b> : ''}</OnInput>
              </td>
              <td>
                <OnInput>{hasWeather && w.rain ? <b style={{ color: 'var(--ink)' }}>{w.rain}</b> : ''}</OnInput>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {c.q1.foot.map((x) => (
        <p key={x} className="small muted" style={{ margin: '2px 0' }}>
          {x}
        </p>
      ))}
      {hasWeather ? (
        <DataBox title="측정 도우미의 「오늘의 날씨」에서 가져온 값">
          <p style={{ margin: 0 }}>
            {w.date} {w.place && `· ${w.place}`} {w.sky && `· ${w.sky}`} · 기온 {w.tempC || '–'} ℃ · 바람 {w.wind || '–'} m/s · 습도 {w.humidity || '–'} % · 일강수 {w.rain || '–'} mm
          </p>
        </DataBox>
      ) : null}
      <EasyCard>
        <p style={{ margin: 0 }}>{c.q1.easy}</p>
      </EasyCard>
      <div className="helper example">
        <div className="h">
          <span>🌱</span> 모범 예시
        </div>
        {c.q1.example}
      </div>

      <OnQ n={2}>{c.q2.title}</OnQ>
      <table className="on-table">
        <tbody>
          <tr>
            <th style={{ width: 150 }}>방문장소</th>
            <td colSpan={2}>
              <OnInput>{f?.place ? <b style={{ color: 'var(--ink)' }}>{f.place}</b> : ''}</OnInput>
            </td>
          </tr>
          <tr>
            <th>조건</th>
            <th>실험 결과</th>
            <th>태양광 발전 시설</th>
          </tr>
          {c.q2.rows.map((r, i) => {
            const key = EXP_KEYS[i];
            const fac = f ? (key === 'irr' ? f.G : key === 'angle' ? f.angle : f.T) : undefined;
            return (
              <tr key={r.cond}>
                <td className="fixed">{r.cond}</td>
                <td>
                  <div className="tiny muted">{r.fixed}</div>
                  <OnInput>{best[key] ? <b style={{ color: 'var(--ink)' }}>{best[key]}</b> : ''}</OnInput>
                </td>
                <td>
                  <OnInput>
                    {fac !== undefined ? (
                      <b style={{ color: 'var(--ink)' }}>
                        {key === 'angle' ? Math.round(fac) : fmt(fac, 1)}
                        {key === 'temp' && f?.tempNote ? ` (${f.tempNote})` : ''}
                      </b>
                    ) : (
                      ''
                    )}
                  </OnInput>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row" style={{ marginBottom: 8 }}>
        <Link className="btn primary" to="/measure?step=8">
          🏢 시설 측정 하러 가기
        </Link>
      </div>
      <EasyCard title={c.q2.easyTitle}>
        <ul>
          {c.q2.easy.map((e, i) => (
            <li key={i}>
              <Rich text={e} />
            </li>
          ))}
        </ul>
      </EasyCard>
      <div className="helper example">
        <div className="h">
          <span>🌱</span> 모범 예시
        </div>
        {c.q2.example}
      </div>

      <OnQ n={3} sub={c.q3.sub}>
        {c.q3.title}
      </OnQ>
      <ExampleNotice />
      <table className="on-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: 90 }}>
              차이점
            </th>
            <th>실험 결과</th>
            <th>태양광 발전 시설</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ExampleBox id="4-3-3" text={c.q3.exExp} tall />
            </td>
            <td>
              <ExampleBox text={c.q3.exFac} tall />
            </td>
          </tr>
          <tr>
            <th>이유</th>
            <td colSpan={2}>
              <ExampleBox text={c.q3.exWhy} tall />
            </td>
          </tr>
        </tbody>
      </table>
      <EasyCard>
        <p style={{ margin: 0 }}>{c.q3.easy}</p>
      </EasyCard>
      <OnSaveButton />
    </OnFrame>
  );
}
