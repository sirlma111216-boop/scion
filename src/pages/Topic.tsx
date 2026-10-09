import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EasyCard } from '../components/Helpers';
import { Rich } from '../components/Rich';
import { YouTube } from '../components/YouTube';
import { config } from '../content/config';
import { topic } from '../content/topic';

export function Topic() {
  const [tab, setTab] = useState(0);
  const t = topic.tabs[tab];
  const cells = topic.waffle.flatMap((w) => Array.from({ length: w.n }, () => w.color));
  return (
    <div className="stack">
      <div>
        <div className="step-badge">1단계</div>
        <h1>주제 알아보기</h1>
        <p className="muted">지능형 과학실 ON의 「공동탐구 주제 소개 · 이해하기」와 같은 순서예요.</p>
      </div>

      <section className="card">
        <h3>공동탐구 주제 소개</h3>
        <p>{topic.onIntro}</p>
        <YouTube id={config.videos.topicIntro} title="공동탐구 주제 소개" />
        <EasyCard title="이 탐구, 한마디로">
          <ul>
            {topic.easyOneLine.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </EasyCard>
      </section>

      <section className="card">
        <h3>공동탐구 주제 이해하기</h3>
        <div className="on-tabs">
          {topic.tabs.map((x, i) => (
            <button key={x.title} type="button" className={`on-tab ${i === tab ? 'active' : ''}`} onClick={() => setTab(i)}>
              {x.title}
            </button>
          ))}
        </div>
        <div className="on-box">{t.on}</div>
        {tab === 0 && (
          <div style={{ margin: '12px 0' }}>
            <div className="waffle" aria-label="전력 100칸 중 에너지원 비중">
              {cells.map((c, i) => (
                <i key={i} style={{ background: c }} />
              ))}
            </div>
            <div className="legend">
              {topic.waffle.map((w) => (
                <span key={w.label}>
                  <i style={{ background: w.color }} />
                  {w.label} {w.n}칸
                </span>
              ))}
            </div>
          </div>
        )}
        <EasyCard>
          <Rich text={t.easy} />
        </EasyCard>
      </section>

      <section className="card">
        <h3>심화탐구 안내</h3>
        <p className="muted small">조건(일사량, 각도, 온도)에 따른 태양 전지의 발전량(생산 전력)을 측정하고 가장 효율적인 조건을 찾아보기</p>
        {config.videos.deepIntro ? (
          <YouTube id={config.videos.deepIntro} title="심화탐구 소개" />
        ) : (
          <p className="small">
            심화탐구 소개 영상은{' '}
            <a href={config.scienceOnUrl} target="_blank" rel="noreferrer">
              지능형 과학실 ON
            </a>
            에서 보세요.
          </p>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table className="on-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                {topic.plan.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topic.plan.cells.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="fixed">
                      {cell && (
                        <Link to={cell.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <span className="badge blue" style={{ marginBottom: 4 }}>
                            이동 →
                          </span>
                          <br />
                          {cell.text}
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EasyCard title="교과서 연결">
          <Rich text={topic.easyCurriculum} />
        </EasyCard>
      </section>
    </div>
  );
}
