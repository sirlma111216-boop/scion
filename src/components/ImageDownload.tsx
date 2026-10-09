import credits from '../content/credits.json';
import { CopyButton } from './CopyButton';

export interface Credit {
  file: string;
  title: string;
  page: string;
  author: string;
  license: string;
  description: string;
  credit: string;
}

export const CREDITS = credits as Credit[];

export function getCredit(file: string): Credit | undefined {
  return CREDITS.find((c) => c.file === file);
}

/** 그림 받기(9-1): 미리보기 + 「그림 내려받기」 + 출처 문자열과 복사 */
export function ImageDownload({ file, compact }: { file: 'n-type.png' | 'p-type.png' | 'solar-cell.png'; compact?: boolean }) {
  const c = getCredit(file);
  const src = `${import.meta.env.BASE_URL}images/upload/${file}`;
  if (!c) return <div className="on-box">그림 준비 중 ({file})</div>;
  return (
    <div className="helper example" style={{ margin: '6px 0' }}>
      <div className="h">
        <span>🖼</span> 그림 받기
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 8, marginBottom: 8 }}>
        <img src={src} alt={c.description} style={{ width: '100%', maxHeight: compact ? 180 : 260, objectFit: 'contain', display: 'block' }} loading="lazy" />
      </div>
      <p className="small" style={{ margin: '0 0 8px' }}>
        {c.description}
      </p>
      <div className="row">
        <a className="btn primary sm" href={src} download={file}>
          ⬇ 그림 내려받기
        </a>
        <span className="small">이 그림을 ON의 ‘이미지 업로드’에 올리세요.</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="small muted">출처 (ON의 「출처:」 칸에 붙여 넣기)</div>
        <div className="example-body" style={{ fontSize: 13, margin: '4px 0' }}>
          {c.credit}
        </div>
        <CopyButton text={c.credit} label="출처 복사" />
      </div>
    </div>
  );
}
