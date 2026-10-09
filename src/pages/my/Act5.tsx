import { DataSentences } from '../../components/DataSentences';
import { EasyCard, ExampleBox, ExampleNotice } from '../../components/Helpers';
import { FakeTip, OnDropdown, OnFrame, OnInput, OnLink, OnQ, OnSaveButton } from '../../components/On';
import { act5, talk } from '../../content/act5';
import { bestValues } from '../../lib/analysis';
import { TEACHER_KEY, loadJson, saveJson } from '../../lib/storage';
import { useSession } from '../../state/SessionContext';
import { useState } from 'react';

export function Act5P1() {
  const c = act5;
  const { session, settings } = useSession();
  const best = bestValues(session);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadJson<{ submit: Record<string, boolean> }>(TEACHER_KEY, { submit: {} }).submit ?? {});
  const toggle = (k: string, v: boolean) => {
    const next = { ...checks, [k]: v };
    setChecks(next);
    const all = loadJson<Record<string, unknown>>(TEACHER_KEY, {});
    saveJson(TEACHER_KEY, { ...all, submit: next });
  };
  const bestText = [best.irr && `일사량 ${best.irr} W/m²`, best.angle && `태양 전지 각도 ${best.angle}°`, best.temp && `온도 ${best.temp} ℃`].filter(Boolean).join(', ');
  return (
    <OnFrame path="/my/5/1" section="탐구평가" activity="활동5. 상호평가">
      <OnDropdown>{c.dropdown}</OnDropdown>
      <OnQ n={1}>{c.q1.title}</OnQ>
      <EasyCard>
        <p style={{ margin: 0 }}>{c.q1.easy}</p>
      </EasyCard>
      <ExampleNotice />
      <table className="on-table">
        <tbody>
          <tr>
            <th rowSpan={2} style={{ width: 110 }}>
              최적의 조건
            </th>
            <th>일사량( W/m²)</th>
            <th>태양 전지 각도( °)</th>
            <th>온도( ℃)</th>
          </tr>
          <tr>
            <td>
              <OnInput>{best.irr && <b style={{ color: 'var(--ink)' }}>{best.irr}</b>}</OnInput>
            </td>
            <td>
              <OnInput>{best.angle && <b style={{ color: 'var(--ink)' }}>{best.angle}</b>}</OnInput>
            </td>
            <td>
              <OnInput>{best.temp && <b style={{ color: 'var(--ink)' }}>{best.temp}</b>}</OnInput>
            </td>
          </tr>
          <tr>
            <th>측정 장소</th>
            <td colSpan={3}>
              <ExampleBox id="5-1-1" text={session.weather.place || settings.place || c.q1.exPlace} />
            </td>
          </tr>
          <tr>
            <th>특이사항</th>
            <td colSpan={3}>
              <ExampleBox text={c.q1.exNote} />
            </td>
          </tr>
          <tr>
            <th colSpan={4} style={{ textAlign: 'left' }}>
              {c.q1.diffQ}
            </th>
          </tr>
          <tr>
            <td colSpan={4}>
              <ExampleBox text={c.q1.exDiff} tall note={bestText ? `우리 조의 최적 조건: ${bestText}` : undefined} />
            </td>
          </tr>
        </tbody>
      </table>

      <OnQ n={2}>{c.q2.title}</OnQ>
      <EasyCard title={c.q2.easyTitle}>
        <p style={{ margin: 0 }}>{c.q2.easy}</p>
      </EasyCard>
      <ExampleBox id="5-1-2" text={c.q2.example} tall />
      <DataSentences session={session} />

      <OnQ n={3}>{c.q3.title}</OnQ>
      <FakeTip>
        <button type="button" className="on-save" style={{ padding: '12px 28px' }}>
          {c.q3.button}
        </button>
      </FakeTip>
      <EasyCard>
        <p style={{ margin: 0 }}>{c.q3.easy}</p>
      </EasyCard>
      <div className="card soft">
        <h4>제출 전 점검표</h4>
        <ul className="checklist">
          {c.q3.checklist.map((item) => (
            <li key={item}>
              <label>
                <input type="checkbox" checked={!!checks[item]} onChange={(e) => toggle(item, e.target.checked)} /> {item}
              </label>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12 }}>
          <OnLink />
        </div>
      </div>
      <OnSaveButton />
    </OnFrame>
  );
}

export function Talk() {
  return (
    <OnFrame path="/my/talk" section="탐구토론" activity="토론방">
      <p>{talk.intro}</p>
      <EasyCard title="글감 3개">
        <ol>
          {talk.prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </EasyCard>
      <OnLink />
    </OnFrame>
  );
}
