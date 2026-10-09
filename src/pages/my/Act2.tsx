import { Link } from 'react-router-dom';
import { Figure } from '../../components/Figure';
import { EasyCard, ExampleBox, ExampleNotice } from '../../components/Helpers';
import { OnBox, OnDropdown, OnFrame, OnQ, OnSaveButton } from '../../components/On';
import { Rich } from '../../components/Rich';
import { ShadowCalc } from '../../components/ShadowCalc';
import { act2p1, act2p2 } from '../../content/act2';
import { useSession } from '../../state/SessionContext';
import { ProcessNav } from './ProcessNav';

const NAV = [
  { to: '/my/2/1', label: '과정 1' },
  { to: '/my/2/2', label: '과정 2' },
];

function LibLink({ hash, label }: { hash: string; label: string }) {
  return (
    <Link className="btn primary sm" to={`/library#${hash}`}>
      {label} →
    </Link>
  );
}

export function Act2P1() {
  const c = act2p1;
  const { settings, setSettings } = useSession();
  return (
    <OnFrame path="/my/2/1" section="탐구계획" activity="활동2. 측정할 데이터 및 도구선정">
      <ProcessNav items={NAV} />
      <OnDropdown>{c.dropdown}</OnDropdown>

      <div className="helper data" style={{ marginTop: 0 }}>
        <div className="h">
          <span>🧰</span> {c.equipment.title}
        </div>
        <p>{c.equipment.intro}</p>
        <table className="plain-table" style={{ background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr>
              <th>재는 것</th>
              <th>센서</th>
              <th>단위</th>
            </tr>
          </thead>
          <tbody>
            {c.equipment.rows.map((r) => (
              <tr key={r[0]}>
                <td>{r[0]}</td>
                <td>{r[1]}</td>
                <td className="num">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OnQ n={1} sub={c.q1.sub}>
        {c.q1.title}
      </OnQ>
      <ExampleNotice />
      <table className="on-table">
        <thead>
          <tr>
            <th style={{ width: 140 }}>요인</th>
            <th>특징</th>
          </tr>
        </thead>
        <tbody>
          {c.q1.rows.map((r, i) => (
            <tr key={r.factor}>
              <td className="fixed">{r.factor}</td>
              <td>
                <ExampleBox id={i === 0 ? '2-1-1' : undefined} text={r.example} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EasyCard>
        <Rich text={c.q1.easy} />
      </EasyCard>

      <OnQ n={2}>{c.q2.title}</OnQ>
      <table className="on-table">
        <thead>
          <tr>
            <th>{c.q2.head}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="on-radio">
                {c.q2.options.map((o) => (
                  <span key={o} className={o === c.q2.picked ? 'picked' : ''}>
                    {o}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <OnBox>
        <ul>
          {c.q2.onBox.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </OnBox>
      <div className="helper example">
        <div className="h">
          <span>🌱</span> 모범 예시
        </div>
        {c.q2.example}
      </div>
      <EasyCard>
        <Rich text={c.q2.easy} />
      </EasyCard>

      <OnQ n={3}>{c.q3.title}</OnQ>
      <LibLink hash="sensor-pyr" label="일사량 센서 사용법 보기" />

      <OnQ n={4}>{c.q4.title}</OnQ>
      <table className="on-table">
        <thead>
          <tr>
            <th colSpan={2}>{c.q4.head}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th style={{ width: 160 }}>예시</th>
            <td className="fixed">{c.q4.fixed}</td>
          </tr>
          <tr>
            <th>{c.q4.rowLabel}</th>
            <td>
              <ExampleBox id="2-1-4" text={c.q4.example} tall />
            </td>
          </tr>
        </tbody>
      </table>
      <EasyCard title={c.q4.easyTitle}>
        <Rich text={c.q4.easy} />
        <div className="grid-2" style={{ marginTop: 8 }}>
          <Figure slot="gen/shadow-pin.png" caption="수직 막대의 그림자로 각도 재기" />
          <Figure slot="photo/shadow-pin-real.jpg" caption="수직 막대와 그림자(예시 이미지)" />
        </div>
        <ShadowCalc pinHeightCm={settings.pinHeightCm} onPinChange={(h) => setSettings({ ...settings, pinHeightCm: h })} />
      </EasyCard>

      <OnQ n={5}>{c.q5.title}</OnQ>
      <table className="on-table">
        <thead>
          <tr>
            <th colSpan={2}>{c.q5.head}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th style={{ width: 160 }}>예시</th>
            <td className="fixed">{c.q5.fixed}</td>
          </tr>
          <tr>
            <th>{c.q5.rowLabel}</th>
            <td>
              <ExampleBox id="2-1-5" text={c.q5.example} />
            </td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">
        📎 참고자료: {c.q5.ref} <span className="badge">ON에서 내려받을 수 있어요</span>
      </p>

      <OnQ n={6}>{c.q6.title}</OnQ>
      <LibLink hash="sensor-st" label="표면 온도 센서 사용법 보기" />

      <OnQ n={7}>{c.q7.title}</OnQ>
      {[c.q7.v, c.q7.i].map((q, i) => (
        <table className="on-table" key={q.head}>
          <thead>
            <tr>
              <th colSpan={2}>{q.head}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={{ width: 160 }}>예시</th>
              <td className="fixed">{q.fixed}</td>
            </tr>
            <tr>
              <th>{q.rowLabel}</th>
              <td>
                <ExampleBox id={i === 0 ? '2-1-7v' : '2-1-7i'} text={q.example} />
              </td>
            </tr>
          </tbody>
        </table>
      ))}
      <EasyCard>
        <Rich text={c.q7.easy} />
      </EasyCard>

      <OnQ n={8}>{c.q8.title}</OnQ>
      <LibLink hash="sensor-energy" label="에너지 센서 사용법 보기" />
      <OnSaveButton />
    </OnFrame>
  );
}

export function Act2P2() {
  const c = act2p2;
  const { settings } = useSession();
  const fill = (s: string) => s.replace('{A}', settings.team[0]).replace('{B}', settings.team[1]).replace('{C}', settings.team[2]).replace('{D}', settings.team[3]);
  return (
    <OnFrame path="/my/2/2" section="탐구계획" activity="활동2. 측정할 데이터 및 도구선정">
      <ProcessNav items={NAV} />
      <OnDropdown>{c.dropdown}</OnDropdown>
      <OnQ n={1}>{c.q1}</OnQ>
      <EasyCard title={c.easyTitle}>
        <ul>
          {c.easy.map((e, i) => (
            <li key={i}>
              <Rich text={e} />
            </li>
          ))}
        </ul>
        <Figure slot="gen/team-roles.png" caption="설치 · 측정 · 입력 · 관리 네 가지 역할" ratio="16:9" />
        <p className="small muted">역할의 이름은 「선생님 → 설정」에서 바꿀 수 있어요(이 기기에만 저장돼요).</p>
      </EasyCard>
      <ExampleNotice />
      <table className="on-table">
        <tbody>
          {c.rows.map((r, i) => (
            <tr key={r.id}>
              <th style={{ width: 150, textAlign: 'left' }}>{r.label}</th>
              <td>
                {r.on && <div className="small muted" style={{ marginBottom: 6 }}>{r.on}</div>}
                {r.example && <ExampleBox id={i === 0 ? '2-2-1' : undefined} text={fill(r.example)} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <OnSaveButton />
    </OnFrame>
  );
}
