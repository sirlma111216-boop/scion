import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TEACHER_KEY, loadJson, saveJson } from '../lib/storage';
import { defaultSettings, useSession, type Settings } from '../state/SessionContext';

const CHECKS = [
  '센서 3개를 충전했다(2시간 이상).',
  '/diagnostics에서 세 센서의 orderCode와 채널·단위가 표(에너지 GDX-NRG: V·mA / 일사량 GDX-PYR: W/m² / 표면 온도 GDX-ST: ℃)와 같은지 확인했다.',
  '태양 전지의 표시 사양(전압, 전류)을 확인했다. 5 V 또는 0.18 A를 넘는 패널은 에너지 센서의 내부 30 Ω 부하를 쓰면 안 된다(외부 부하 필요, 외부 부하는 30 V·1 A까지).',
  '부하를 정했다. 참고: 부하에 따라 결과가 달라진다. 저항이 너무 크면(전압이 거의 최대인 영역) 일사량·각도를 바꿔도 전력이 조금밖에 변하지 않고, 저항이 너무 작으면(전류가 거의 최대인 영역) 온도를 바꿔도 전력이 거의 변하지 않는다. 그래서 최대 전력 지점에서 전압이 약간 더 큰 쪽에 고정하기를 권한다. 사전에 연습 측정으로 세 실험 모두 경향이 보이는지 확인한다.',
  '맑은 날 예비 측정에서 전류가 0.1 A보다 충분히 큰지 확인했다. ON은 「소수 한자리」 입력을 요구하므로 전류가 작으면(예: 0.07 A) 0.1 또는 0.0으로 뭉개진다. ON 입력 칸에 소수 둘째 자리가 들어가는지도 직접 확인한다.',
  '측정 기기가 크롬(윈도우·크롬북·안드로이드)인지 확인했다.',
  '그림 3장(n형, p형, 태양 전지 구조)의 내용과 출처가 적절한지 확인했다.',
];

const SLOTS = [
  ['gen/hero.png', '홈 상단', '16:9', '학교 옥상의 태양광 패널과 측정하는 학생들'],
  ['gen/analogy-seats.png', '활동 1-과정 1 먼저 읽기', '4:3', '빈자리가 반대쪽으로 움직이는 것처럼 보여요(양공)'],
  ['gen/analogy-slide.png', '활동 1-과정 1 2번 해설', '4:3', 'pn 접합의 전기장은 전자와 양공을 갈라 보내는 미끄럼틀'],
  ['gen/solar-cell-layers.png', '활동 1-과정 2 3번 해설', '4:3', '태양 전지는 여러 층을 쌓은 샌드위치'],
  ['gen/light-angle.png', '활동 4-과정 1 4번 해설', '16:9', '똑바로 비추면 좁고 밝게, 비스듬히 비추면 넓고 흐리게'],
  ['gen/shadow-pin.png', '활동 2-과정 1 4번, 실험 2', '4:3', '수직 막대의 그림자로 각도 재기'],
  ['gen/shade-layers.png', '실험 1', '4:3', '가림막 겹 수로 일사량 바꾸기'],
  ['gen/cooling-panel.png', '실험 3', '4:3', '얼음팩으로 태양 전지 식히기'],
  ['gen/team-roles.png', '활동 2-과정 2, 준비', '16:9', '설치 · 측정 · 입력 · 관리 네 가지 역할'],
  ['photo/setup-overview.jpg', '연결과 설치', '4:3', '우리 장비를 모두 설치한 모습(예시 이미지)'],
  ['photo/energy-wiring.jpg', '자료실, 연결과 설치', '4:3', '에너지 센서 연결과 Load 스위치(예시 이미지)'],
  ['photo/pyranometer-mount.jpg', '자료실', '4:3', '일사량 센서를 판에 고정한 모습(예시 이미지)'],
  ['photo/temp-sensor-back.jpg', '자료실', '4:3', '표면 온도 센서를 뒷면에 붙인 모습(예시 이미지)'],
  ['photo/shadow-pin-real.jpg', '활동 2-과정 1 4번, 실험 2', '4:3', '수직 막대와 그림자(예시 이미지)'],
];

export function Teacher() {
  const { settings, setSettings } = useSession();
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadJson<{ pre: Record<string, boolean> }>(TEACHER_KEY, { pre: {} }).pre ?? {});
  const [draft, setDraft] = useState<Settings>(settings);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const toggle = (k: string, v: boolean) => {
    const next = { ...checks, [k]: v };
    setChecks(next);
    const all = loadJson<Record<string, unknown>>(TEACHER_KEY, {});
    saveJson(TEACHER_KEY, { ...all, pre: next });
  };
  const save = () => {
    setSettings(draft);
    setMsg('저장했어요 (이 기기에만).');
    window.setTimeout(() => setMsg(''), 2000);
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'scion-settings.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = async (f: File) => {
    try {
      const obj = JSON.parse(await f.text());
      const next = { ...defaultSettings(), ...obj };
      setDraft(next);
      setSettings(next);
      setMsg('설정을 가져왔어요.');
    } catch {
      setMsg('파일을 읽을 수 없어요.');
    }
  };
  return (
    <div className="stack">
      <div>
        <h1>선생님</h1>
        <p className="muted">측정 전 점검, 기기 설정, 자료 넣기 안내. 민감한 정보는 없고, 이름 등 설정은 이 기기에만 저장돼요.</p>
      </div>

      <section className="card">
        <h3>측정 전 점검</h3>
        <ul className="checklist">
          {CHECKS.map((c, i) => (
            <li key={c}>
              <label>
                <input type="checkbox" checked={!!checks[c]} onChange={(e) => toggle(c, e.target.checked)} />
                <span>
                  <b>{i + 1}.</b> {c}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn primary" to="/diagnostics">
            센서 진단 화면 열기
          </Link>
          <Link className="btn" to="/measure">
            측정 도우미
          </Link>
        </div>
      </section>

      <section className="card">
        <h3>설정</h3>
        <p className="small muted">이 설정은 이 기기에만 저장돼요. 다른 기기에는 ‘설정 내보내기’ 파일을 가져오세요.</p>
        <div className="form-grid">
          {draft.team.map((n, i) => (
            <label key={i} className="field">
              팀원 {i + 1} — {draft.roles[i]}
              <input value={n} onChange={(e) => setDraft({ ...draft, team: draft.team.map((x, j) => (j === i ? e.target.value : x)) })} />
            </label>
          ))}
          <label className="field">
            측정 장소 이름
            <input value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} />
          </label>
          <label className="field">
            위도
            <input type="number" step="0.0001" value={draft.lat} onChange={(e) => setDraft({ ...draft, lat: parseFloat(e.target.value) || 0 })} />
          </label>
          <label className="field">
            경도
            <input type="number" step="0.0001" value={draft.lon} onChange={(e) => setDraft({ ...draft, lon: parseFloat(e.target.value) || 0 })} />
          </label>
          <label className="field">
            막대 높이 (cm)
            <input type="number" step="0.1" value={draft.pinHeightCm} onChange={(e) => setDraft({ ...draft, pinHeightCm: parseFloat(e.target.value) || 5 })} />
          </label>
          <label className="field">
            표본 간격 (ms)
            <input type="number" step="100" value={draft.periodMs} onChange={(e) => setDraft({ ...draft, periodMs: parseInt(e.target.value, 10) || 500 })} />
          </label>
          <label className="field">
            측정 창 길이 (초)
            <input type="number" step="1" value={draft.windowSec} onChange={(e) => setDraft({ ...draft, windowSec: parseInt(e.target.value, 10) || 5 })} />
          </label>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" onClick={save}>
            저장
          </button>
          <button type="button" className="btn" onClick={exportJson}>
            설정 내보내기(JSON)
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            설정 가져오기
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          <button type="button" className="btn text" onClick={() => setDraft(defaultSettings())}>
            기본값으로
          </button>
          {msg && <span className="small">{msg}</span>}
        </div>
      </section>

      <section className="card">
        <h3>자료 넣기 안내</h3>
        <h4>이미지 슬롯</h4>
        <p className="small muted">
          <code>public/images/</code> 아래 같은 이름으로 파일을 넣고 다시 배포하면 보입니다. 없는 슬롯은 점선 빈 상자로 보여요.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="plain-table">
            <thead>
              <tr>
                <th>슬롯</th>
                <th>쓰이는 곳</th>
                <th>비율</th>
                <th>캡션</th>
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((s) => (
                <tr key={s[0]}>
                  <td>
                    <code>{s[0]}</code>
                  </td>
                  <td>{s[1]}</td>
                  <td>{s[2]}</td>
                  <td>{s[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4 style={{ marginTop: 16 }}>그 밖의 자료</h4>
        <ul>
          <li>
            <code>public/data/solar-facilities.csv</code> — 있으면 활동 4-과정 2에 검색 가능한 표로 보여요(지금은 없음).
          </li>
          <li>
            <code>src/content/config.ts</code> — 영상 주소(심화탐구 소개 영상 <code>deepIntro</code>가 비어 있어요), 학교 이름, 위치 기본값.
          </li>
          <li>
            <code>src/content/*.ts</code> — 해설·예시·화면 문구. 문구만 고쳐 다시 배포하면 돼요.
          </li>
        </ul>
      </section>
    </div>
  );
}
