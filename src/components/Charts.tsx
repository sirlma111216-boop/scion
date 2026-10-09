// 조건–평균 전력 막대그래프(8-2, 활동 4-과정 1-1번). 회차별 점을 겹쳐 표시.
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { summarize } from '../lib/analysis';
import { EXP_META, type ExpKey, type Session } from '../lib/model';
import { fmt } from '../lib/calc';

export function ExpChart({ expKey, session }: { expKey: ExpKey; session: Session }) {
  const exp = session.experiments[expKey];
  const sums = summarize(expKey, exp).filter((s) => s.n > 0);
  if (!sums.length) return <div className="on-box">등록된 수집데이터가 없습니다.</div>;
  const meta = EXP_META[expKey];
  const data = sums.map((s) => {
    const cond = exp.conditions.find((c) => c.id === s.id)!;
    const trials = cond.trials.map((t) => Number(t.P.toFixed(4)));
    return {
      name: s.value === undefined ? s.label : expKey === 'angle' ? `${Math.round(s.value)}°` : `${fmt(s.value, expKey === 'temp' ? 1 : 0)}`,
      mean: Number(s.meanP.toFixed(4)),
      t1: trials[0],
      t2: trials[1],
      t3: trials[2],
    };
  });
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#eef0f3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} label={{ value: meta.condHeader, position: 'insideBottom', offset: -2, fontSize: 11, fill: '#7c828a' }} />
          <YAxis tick={{ fontSize: 12 }} width={44} label={{ value: '평균 전력(W)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#7c828a' }} />
          <Tooltip formatter={(v) => `${Number(v).toFixed(3)} W`} />
          <Bar dataKey="mean" name="평균 전력" fill="#0052ff" radius={[6, 6, 0, 0]} maxBarSize={56} />
          <Scatter dataKey="t1" name="1회" fill="#0a0b0d" />
          <Scatter dataKey="t2" name="2회" fill="#0a0b0d" />
          <Scatter dataKey="t3" name="3회" fill="#0a0b0d" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
