// CSV 내보내기(회차별 한 줄). 엑셀에서 한글이 깨지지 않게 BOM 포함.
import { EXP_META, conditionValue, type ExpKey, type Session } from './model';

export const CSV_HEADER = ['실험', '조건', '조건값', '회차', '시각', '전압(V)', '전류(A)', '전력(W)', '일사량(W/m²)', '온도(℃)', '표본수', '흔들림', '공급방식', '연습'];

function esc(s: string): string {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(session: Session): string {
  const lines = [CSV_HEADER.join(',')];
  for (const key of ['irr', 'angle', 'temp'] as ExpKey[]) {
    const exp = session.experiments[key];
    for (const c of exp.conditions) {
      const cv = conditionValue(key, c);
      c.trials.forEach((t, i) => {
        lines.push(
          [
            EXP_META[key].short,
            c.label,
            cv === undefined ? '' : String(Math.round(cv * 10) / 10),
            String(i + 1),
            new Date(t.t).toISOString(),
            t.V.toFixed(3),
            t.I.toFixed(4),
            t.P.toFixed(4),
            t.G === undefined ? '' : t.G.toFixed(1),
            t.T === undefined ? '' : t.T.toFixed(1),
            String(t.n),
            t.unstable ? '흔들림' : '',
            t.source,
            session.demo ? '연습' : '',
          ]
            .map(esc)
            .join(','),
        );
      });
    }
  }
  return '﻿' + lines.join('\r\n');
}
