// 결과 정리(8장): ON 입력용 표, 그래프, 채운 문장, 공유 링크·QR, 내보내기·가져오기·초기화
import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExpChart } from '../components/Charts';
import { CopyButton } from '../components/CopyButton';
import { DataSentences } from '../components/DataSentences';
import { OnDataTable } from '../components/OnDataTable';
import { QrCode } from '../components/QrCode';
import { bestCondition, summarize } from '../lib/analysis';
import { fmt } from '../lib/calc';
import { toCsv } from '../lib/csv';
import { EXP_KEYS, EXP_META, type Session } from '../lib/model';
import { decodeShare, shareUrl } from '../lib/share';
import { clearSession } from '../lib/storage';
import { useSession } from '../state/SessionContext';

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function Results() {
  const ctx = useSession();
  const [params, setParams] = useSearchParams();
  const d = params.get('d');
  const received = useMemo(() => (d ? decodeShare(d) : null), [d]);
  const readOnly = !!received;
  const session: Session = received ?? ctx.session;
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const link = useMemo(() => (readOnly ? '' : shareUrl(ctx.session)), [ctx.session, readOnly]);

  const hasAny = EXP_KEYS.some((k) => session.experiments[k].conditions.some((c) => c.trials.length));
  const stamp = new Date().toISOString().slice(0, 10);

  const saveReceived = () => {
    if (!received) return;
    if (!confirm('받은 데이터를 내 기기에 저장할까요? 지금 기기의 기록은 덮어써져요.')) return;
    ctx.replace(received);
    setParams({});
    setMsg('내 기기에 저장했어요.');
  };
  const importJson = async (f: File) => {
    try {
      const obj = JSON.parse(await f.text()) as Session;
      if (obj.version !== 1 || !obj.experiments) throw new Error();
      if (!confirm('가져온 데이터로 지금 기기의 기록을 덮어쓸까요?')) return;
      ctx.replace(obj);
      setMsg('가져왔어요.');
    } catch {
      setMsg('파일을 읽을 수 없어요.');
    }
  };
  const reset = () => {
    if (!confirm('모든 측정 기록을 지울까요? 지우기 전에 JSON으로 내보내 두는 것을 권해요.')) return;
    if (!confirm('정말 지울까요? 되돌릴 수 없어요.')) return;
    clearSession(ctx.demo);
    ctx.reset();
    setMsg('지웠어요.');
  };

  return (
    <div className="stack">
      <div className="row no-print" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="step-badge">4단계</div>
          <h1 style={{ marginBottom: 4 }}>결과 정리</h1>
          <p className="muted small">측정값을 지능형 과학실 ON의 입력 표와 똑같은 모양으로 보여 줘요. 상자 안의 숫자를 그대로 옮겨 적으세요.</p>
        </div>
        <div className="row">
          {session.demo && <span className="badge yellow">연습 — 가상 값</span>}
          {readOnly && <span className="badge blue">받은 데이터(읽기 전용)</span>}
          <Link className="btn" to="/my/3/1">
            ON 활동 3 화면 보기
          </Link>
        </div>
      </div>
      {readOnly && (
        <div className="alert info row" style={{ justifyContent: 'space-between' }}>
          <span>공유 링크로 받은 데이터예요. 내 기기에 저장하려면 오른쪽 버튼을 누르세요.</span>
          <button type="button" className="btn primary sm" onClick={saveReceived}>
            내 기기에 저장
          </button>
        </div>
      )}
      {msg && <div className="toast">{msg}</div>}
      {!hasAny && (
        <div className="card soft">
          아직 측정한 값이 없어요.{' '}
          <Link className="btn primary sm" to="/measure">
            측정 도우미로
          </Link>
        </div>
      )}

      <section className="card">
        <h2>ON 입력용 표</h2>
        {EXP_KEYS.map((k, i) => (
          <div key={k} style={{ marginBottom: 24 }}>
            <h3>
              {i + 1} . {k === 'irr' ? '일사량(조도)에 따른 전력을 측정하여 기록해 볼까요?' : k === 'angle' ? '태양 전지 각도에 따른 전력을 측정하여 기록해 볼까요?' : '온도에 따른 전력을 측정하여 기록해 볼까요?'}
            </h3>
            <OnDataTable expKey={k} session={session} showHelp={i === 0} stepMode />
          </div>
        ))}
        {session.load && (
          <p className="small muted">
            부하: {session.load.kind === 'internal' ? '내부 30 Ω' : `외부 약 ${session.load.R?.toFixed(1) ?? '?'} Ω`} · 막대 높이 {session.pinHeightCm} cm
          </p>
        )}
      </section>

      <section className="card">
        <h2>그래프와 분석</h2>
        <div className="grid-3">
          {EXP_KEYS.map((k) => {
            const best = bestCondition(summarize(k, session.experiments[k]));
            return (
              <div key={k}>
                <h4>{EXP_META[k].title}</h4>
                <ExpChart expKey={k} session={session} />
                <div className="card soft" style={{ padding: 12, marginTop: 8 }}>
                  <div className="small muted">가장 전력이 큰 조건 → 활동 4-과정 1-2번</div>
                  {best && best.value !== undefined ? (
                    <div>
                      <b className="num" style={{ fontSize: 24 }}>
                        {k === 'angle' ? Math.round(best.value) : fmt(best.value, 1)}
                      </b>{' '}
                      {EXP_META[k].unit} <span className="small muted">({best.label}, 평균 {fmt(best.meanP, 3)} W)</span>
                    </div>
                  ) : (
                    <span className="small">측정한 뒤에 채워져요</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16 }}>
          <DataSentences session={session} />
        </div>
        <details>
          <summary>정밀 표 (회차별 V, I, P, G, T 전부)</summary>
          <div style={{ overflowX: 'auto' }}>
            <table className="plain-table">
              <thead>
                <tr>
                  <th>실험</th>
                  <th>조건</th>
                  <th>회차</th>
                  <th>시각</th>
                  <th>V</th>
                  <th>I (A)</th>
                  <th>P (W)</th>
                  <th>G (W/m²)</th>
                  <th>T (℃)</th>
                  <th>표본</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {EXP_KEYS.flatMap((k) =>
                  session.experiments[k].conditions.flatMap((c) =>
                    c.trials.map((t, i) => (
                      <tr key={`${c.id}-${i}`}>
                        <td>{EXP_META[k].short}</td>
                        <td>{c.label}</td>
                        <td>{i + 1}</td>
                        <td className="num">{new Date(t.t).toLocaleTimeString('ko-KR')}</td>
                        <td className="num">{t.V.toFixed(3)}</td>
                        <td className="num">{t.I.toFixed(4)}</td>
                        <td className="num">{t.P.toFixed(4)}</td>
                        <td className="num">{t.G?.toFixed(1) ?? '–'}</td>
                        <td className="num">{t.T?.toFixed(1) ?? '–'}</td>
                        <td className="num">{t.n}</td>
                        <td className="tiny">
                          {t.unstable && '흔들림 '}
                          {t.source !== 'sensor' && t.source}
                        </td>
                      </tr>
                    )),
                  ),
                )}
                {session.confirm && (
                  <tr>
                    <td>확인</td>
                    <td>최적 조건</td>
                    <td>1</td>
                    <td className="num">{new Date(session.confirm.t).toLocaleTimeString('ko-KR')}</td>
                    <td className="num">{session.confirm.V.toFixed(3)}</td>
                    <td className="num">{session.confirm.I.toFixed(4)}</td>
                    <td className="num">{session.confirm.P.toFixed(4)}</td>
                    <td className="num">{session.confirm.G?.toFixed(1) ?? '–'}</td>
                    <td className="num">{session.confirm.T?.toFixed(1) ?? '–'}</td>
                    <td className="num">{session.confirm.n}</td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {!readOnly && (
        <section className="card no-print">
          <h2>공유 · 내보내기</h2>
          <div className="grid-2">
            <div>
              <h4>공유 링크와 QR</h4>
              <p className="small muted">측정 데이터만(이름·장소 없음) 압축해 주소에 담아요. 다른 학생이 자기 기기로 이 QR을 찍으면 같은 결과 표를 볼 수 있어요.</p>
              {link && (
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <QrCode text={link} size={180} caption={`링크 길이 ${link.length}자`} />
                  <div className="stack" style={{ flex: 1 }}>
                    <CopyButton text={link} label="링크 복사" className="btn primary sm" />
                    <a className="btn sm" href={link} target="_blank" rel="noreferrer">
                      새 창에서 열기
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4>내보내기 / 가져오기</h4>
              <div className="row" style={{ marginBottom: 8 }}>
                <button type="button" className="btn" onClick={() => download(`scion-${stamp}${session.demo ? '-연습' : ''}.json`, JSON.stringify(session, null, 2), 'application/json')}>
                  JSON (전체 백업)
                </button>
                <button type="button" className="btn" onClick={() => download(`scion-${stamp}${session.demo ? '-연습' : ''}.csv`, toCsv(session), 'text/csv;charset=utf-8')}>
                  CSV (회차별)
                </button>
                <button type="button" className="btn" onClick={() => window.print()}>
                  🖨 인쇄용(A4)
                </button>
              </div>
              <div className="row">
                <button type="button" className="btn outline" onClick={() => fileRef.current?.click()}>
                  JSON 가져오기
                </button>
                <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
                <button type="button" className="btn danger" onClick={reset}>
                  모든 기록 지우기
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
