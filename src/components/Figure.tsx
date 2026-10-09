import { useState } from 'react';

/** 이미지 슬롯(9-2). 파일이 없으면 점선 빈 상자에 캡션과 「그림 준비 중」. */
export function Figure({ slot, caption, ratio = '4:3', wide }: { slot: string; caption: string; ratio?: '4:3' | '16:9'; wide?: boolean }) {
  const [missing, setMissing] = useState(false);
  const [retry, setRetry] = useState(0);
  const src = `${import.meta.env.BASE_URL}images/${slot}${retry ? `?r=${retry}` : ''}`;
  // 일시적인 네트워크 오류(연결 끊김)는 한 번 더 시도하고, 그래도 없으면 빈 슬롯으로
  const onError = () => {
    if (retry < 1) window.setTimeout(() => setRetry((r) => r + 1), 1500);
    else setMissing(true);
  };
  return (
    <figure className={`figure ${wide ? 'wide' : ''}`}>
      <div className={`frame ${ratio === '16:9' ? 'r169' : 'r43'}`}>
        {!missing && <img src={src} alt={caption} loading="lazy" onError={onError} />}
        {missing && (
          <div className="empty">
            <span>🖼 그림 준비 중</span>
            <span className="tiny">
              {caption} · <code>{slot}</code>
            </span>
          </div>
        )}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
