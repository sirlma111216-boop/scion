import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QrCode({ text, size = 200, caption }: { text: string; size?: number; caption?: string }) {
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: 'L' })
      .then((u) => {
        if (!alive) return;
        setUrl(u);
        setErr('');
      })
      .catch(() => {
        if (!alive) return;
        setUrl('');
        setErr('내용이 너무 길어 QR 코드를 만들 수 없어요. 링크를 복사해 보내 주세요.');
      });
    return () => {
      alive = false;
    };
  }, [text, size]);
  return (
    <div className="qr">
      {url && <img src={url} alt="QR 코드" width={size} height={size} />}
      {err && <span className="small muted">{err}</span>}
      {caption && <span className="small muted">{caption}</span>}
    </div>
  );
}
