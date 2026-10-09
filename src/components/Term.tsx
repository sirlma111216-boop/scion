import { useEffect, useRef, useState, type ReactNode } from 'react';
import { findTerm } from '../content/terms';

/** 본문 속 용어. 점선 밑줄, 누르면 말풍선으로 뜻. */
export function Term({ word, children }: { word: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const t = findTerm(word);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);
  if (!t) return <>{children ?? word}</>;
  return (
    <button type="button" className="term" ref={ref} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
      {children ?? word}
      {open && (
        <span className="pop" role="tooltip">
          <b>{t.term}</b>
          <br />
          {t.def}
        </span>
      )}
    </button>
  );
}
