// ON 「활동 3. 데이터수집」 표를 모양 그대로 재현하고 측정값을 채운다(5-6, 8-1).
import { useState } from 'react';
import { onRow, precisionWarnings, type OnRow } from '../lib/analysis';
import { EXP_META, type ExpKey, type Session } from '../lib/model';
import { CopyButton } from './CopyButton';
import { WarnBox } from './Helpers';


interface Focus {
  condId: string;
  field: 'condValue' | 'V' | 'I' | 'note';
  idx: number; // V/I 회차
}

export function OnDataTable({ expKey, session, showHelp = true, stepMode = false }: { expKey: ExpKey; session: Session; showHelp?: boolean; stepMode?: boolean }) {
  const meta = EXP_META[expKey];
  const exp = session.experiments[expKey];
  const rows = exp.conditions.map((c) => onRow(expKey, c, session));
  const [focus, setFocus] = useState<Focus | null>(null);
  const warns = precisionWarnings(expKey, exp);
  const hasData = exp.conditions.some((c) => c.trials.length);

  // 한 줄씩 따라 입력: 조건값 → 전압 1·2·3 → 전류 1·2·3 → 특이사항
  const seq: Focus[] = [];
  for (const r of rows) {
    seq.push({ condId: r.condId, field: 'condValue', idx: 0 });
    for (let i = 0; i < 3; i += 1) seq.push({ condId: r.condId, field: 'V', idx: i });
    for (let i = 0; i < 3; i += 1) seq.push({ condId: r.condId, field: 'I', idx: i });
    seq.push({ condId: r.condId, field: 'note', idx: 0 });
  }
  const pos = focus ? seq.findIndex((f) => f.condId === focus.condId && f.field === focus.field && f.idx === focus.idx) : -1;
  const isFocus = (condId: string, field: Focus['field'], idx = 0) => !!focus && focus.condId === condId && focus.field === field && focus.idx === idx;
  const cls = (filled: boolean, f: boolean) => `on-input ${filled ? 'filled' : ''} ${f ? 'focus' : ''}`;

  return (
    <div>
      {!showHelp && stepMode && hasData && (
        <div className="row" style={{ marginBottom: 8 }}>
          <StepControls focus={focus} pos={pos} seq={seq} setFocus={setFocus} />
        </div>
      )}
      {showHelp && hasData && (
        <div className="helper data" style={{ marginTop: 0 }}>
          <div className="h">
            <span>📝</span> ON에 옮겨 적기
          </div>
          <ol style={{ margin: 0 }}>
            <li>ON에서 활동 3. 데이터수집을 열어요.</li>
            <li>상자 안의 숫자를 같은 자리에 그대로 입력해요.</li>
            <li>조건이 3개보다 많으면 ON에서 ‘+ 추가’를 눌러요.</li>
            <li>다 입력하고 ‘저장’을 눌러요.</li>
          </ol>
          {stepMode && (
            <div className="row" style={{ marginTop: 8 }}>
              <StepControls focus={focus} pos={pos} seq={seq} setFocus={setFocus} />
            </div>
          )}
        </div>
      )}
      {warns.length > 0 && (
        <WarnBox title="주의 — 반올림 때문에 정보가 사라져요">
          <ul style={{ margin: 0 }}>
            {warns.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </WarnBox>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="on-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 110 }}>
                {meta.condHeader}
              </th>
              <th rowSpan={2} style={{ width: 80 }}>
                측정한 물리량
              </th>
              <th colSpan={4}>측정값 (측정값은 소수 한자리까지 입력해 주세요.)</th>
              <th rowSpan={2}>특이사항 ({meta.noteHeader})</th>
            </tr>
            <tr>
              <th>1회</th>
              <th>2회</th>
              <th>3회</th>
              <th>평균</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <RowGroup key={r.condId} r={r} isFocus={isFocus} cls={cls} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="small muted">※ 최대 5개까지 추가할 수 있습니다.</span>
        <span className="small muted">
          회색 「확인용」 칸은 ON이 자동으로 계산해요. ON이 자동으로 계산한 평균·전력과 조금 다를 수 있어요. ON에 나온 값이 기준이에요.
        </span>
      </div>
    </div>
  );
}

function StepControls({ focus, pos, seq, setFocus }: { focus: Focus | null; pos: number; seq: Focus[]; setFocus: (f: Focus | null) => void }) {
  if (!focus)
    return (
      <button type="button" className="btn sm primary" onClick={() => setFocus(seq[0])}>
        한 줄씩 따라 입력 시작
      </button>
    );
  return (
    <>
      <span className="small">
        지금 입력할 칸: <b>{pos + 1}</b> / {seq.length}
      </span>
      <button type="button" className="btn sm" onClick={() => setFocus(seq[Math.max(0, pos - 1)])} disabled={pos <= 0}>
        이전
      </button>
      <button type="button" className="btn sm primary" onClick={() => (pos + 1 < seq.length ? setFocus(seq[pos + 1]) : setFocus(null))}>
        {pos + 1 < seq.length ? '다음' : '끝'}
      </button>
      <button type="button" className="btn sm text" onClick={() => setFocus(null)}>
        그만
      </button>
    </>
  );
}

function RowGroup({ r, isFocus, cls }: { r: OnRow; isFocus: (id: string, f: Focus['field'], i?: number) => boolean; cls: (filled: boolean, f: boolean) => string }) {
  return (
    <>
      <tr>
        <td rowSpan={3}>
          <div className={cls(!!r.condValue, isFocus(r.condId, 'condValue'))}>{r.condValue || ' '}</div>
        </td>
        <td className="fixed">전압(V)</td>
        {r.V.map((v, i) => (
          <td key={i} className="num">
            <div className={cls(!!v, isFocus(r.condId, 'V', i))}>{v || ' '}</div>
            {r.Vprecise[i] && <div className="tiny muted num">{r.Vprecise[i]}</div>}
          </td>
        ))}
        <td className="auto">
          {r.Vmean && (
            <>
              <span className="num">{r.Vmean}</span>
              <div className="tiny">확인용</div>
            </>
          )}
        </td>
        <td rowSpan={3}>
          <div className={cls(!!r.note, isFocus(r.condId, 'note'))} style={{ minHeight: 100, fontSize: 13, fontWeight: 400, lineHeight: 1.4 }}>
            {r.note || ' '}
          </div>
          {r.note && (
            <div style={{ marginTop: 4 }}>
              <CopyButton text={r.note} className="btn sm" />
            </div>
          )}
        </td>
      </tr>
      <tr>
        <td className="fixed">전류(A)</td>
        {r.I.map((v, i) => (
          <td key={i} className="num">
            <div className={cls(!!v, isFocus(r.condId, 'I', i))}>{v || ' '}</div>
            {r.Iprecise[i] && <div className="tiny muted num">{r.Iprecise[i]}</div>}
          </td>
        ))}
        <td className="auto">
          {r.Imean && (
            <>
              <span className="num">{r.Imean}</span>
              <div className="tiny">확인용</div>
            </>
          )}
        </td>
      </tr>
      <tr>
        <td className="fixed">전력(W)</td>
        {r.P.map((v, i) => (
          <td key={i} className="auto">
            {v && (
              <>
                <span className="num">{v}</span>
                <div className="tiny">확인용</div>
              </>
            )}
          </td>
        ))}
        <td className="auto">
          {r.Pmean && (
            <>
              <span className="num">{r.Pmean}</span>
              <div className="tiny">확인용</div>
            </>
          )}
        </td>
      </tr>
    </>
  );
}
