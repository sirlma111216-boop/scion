// 콘텐츠 문자열의 간단한 표기: [[용어]] → 용어 말풍선, **굵게** → strong, 줄바꿈 유지.
import { Fragment, type ReactNode } from 'react';
import { Term } from './Term';

const TOKEN = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*)/g;

export function rich(text: string): ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((p, i) => {
    if (p.startsWith('[[') && p.endsWith(']]')) {
      const inner = p.slice(2, -2);
      // [[표시|용어]] 형태 지원
      const [label, key] = inner.includes('|') ? inner.split('|') : [inner, inner];
      return <Term key={i} word={key}>{label}</Term>;
    }
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const lines = p.split('\n');
    return (
      <Fragment key={i}>
        {lines.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}

export function Rich({ text }: { text: string }) {
  return <>{rich(text)}</>;
}
