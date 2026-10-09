import { Link } from 'react-router-dom';
import { Figure } from '../components/Figure';
import { SIDEBAR } from '../components/On';
import { completion } from '../lib/analysis';
import { EXP_KEYS, EXP_META } from '../lib/model';
import { useSession } from '../state/SessionContext';

const BIG = [
  { to: '/topic', n: '1단계', t: '주제 알아보기', d: '이 탐구가 무엇인지, 왜 하는지 10분 만에' },
  { to: '/my/1/1', n: '2단계', t: '나의 공동탐구', d: 'ON 화면 그대로 따라가며 활동 1~5 답 쓰기' },
  { to: '/measure', n: '3단계', t: '측정 도우미', d: '센서를 연결하고 화면이 시키는 대로 누르기' },
  { to: '/results', n: '4단계', t: '결과 정리', d: 'ON 표 모양으로 옮겨 적고 문장 만들기' },
];

export function Home() {
  const { session, progress, demo } = useSession();
  const allIds = SIDEBAR.flatMap((g) => g.items.flatMap((i) => i.ids));
  const doneCount = allIds.filter((id) => progress[id]).length;
  const comp = completion(session);
  return (
    <div className="stack">
      <section className="hero">
        <div>
          <span className="badge" style={{ background: '#16181c', color: '#fff' }}>
            지능형 과학실 ON · 공동탐구
          </span>
          <h1 style={{ marginTop: 12 }}>우리는 체인지메이커!</h1>
          <p>
            학교(지역)의 태양광 발전량을 늘리자! — 일사량·각도·온도 조건에 따라 태양 전지가 만드는 전력을 직접 재고, 가장 효율적인 조건을 찾아 우리 학교에 제안해요.
          </p>
          <div className="row">
            <Link className="btn primary big" to="/my/1/1">
              나의 공동탐구 시작
            </Link>
            <Link className="btn big" style={{ background: '#16181c', color: '#fff' }} to="/measure">
              측정 도우미
            </Link>
          </div>
        </div>
        <Figure slot="gen/hero.png" caption="학교 옥상의 태양광 패널과 측정하는 학생들" ratio="16:9" wide />
      </section>

      <section className="card soft">
        <h3>오늘 할 일</h3>
        <div className="grid-3">
          <div>
            <div className="small muted">ON에 쓸 답 (「다 썼어요」 체크)</div>
            <div className="num" style={{ fontSize: 32 }}>
              {doneCount} / {allIds.length}
            </div>
            <div className="progress">
              <div style={{ width: `${(doneCount / allIds.length) * 100}%` }} />
            </div>
          </div>
          {EXP_KEYS.map((k) => (
            <div key={k}>
              <div className="small muted">
                {EXP_META[k].title} {demo && <span className="badge yellow">연습</span>}
              </div>
              <div className="num" style={{ fontSize: 32 }}>
                {comp[k].done} / {comp[k].conds} 조건
              </div>
              <div className="progress">
                <div style={{ width: `${(comp[k].done / Math.max(1, comp[k].conds)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-2">
        {BIG.map((b) => (
          <Link key={b.to} to={b.to} className="card card-link">
            <div className="step-badge">{b.n}</div>
            <h2 style={{ marginBottom: 6 }}>{b.t}</h2>
            <p className="muted" style={{ margin: 0 }}>
              {b.d}
            </p>
          </Link>
        ))}
      </section>

      <section className="card">
        <h3>전체 흐름 한눈에</h3>
        <div className="roadmap">
          {SIDEBAR.flatMap((g) =>
            g.items.map((it) => {
              const d = it.ids.filter((id) => progress[id]).length;
              return (
                <Link key={it.to} to={it.to} className={it.ids.length && d === it.ids.length ? 'done' : ''}>
                  <span className="n">{g.group}</span>
                  {it.label}
                  {it.ids.length > 0 && (
                    <span className="tiny muted">
                      {' '}
                      · {d}/{it.ids.length}
                    </span>
                  )}
                </Link>
              );
            }),
          )}
        </div>
      </section>
    </div>
  );
}
