import { useEffect, useState } from 'react';
import { sunPosition } from '../lib/solar';
import { useSession } from '../state/SessionContext';

/** 태양 높이 계산기(7-1). 설정된 위치 또는 기기 위치 + 현재 시각 */
export function SunCalc({ compact }: { compact?: boolean }) {
  const { settings } = useSession();
  const [pos, setPos] = useState<{ lat: number; lon: number; src: '설정' | '기기' }>({ lat: settings.lat, lon: settings.lon, src: '설정' });
  const [now, setNow] = useState(() => new Date());
  const [geoErr, setGeoErr] = useState('');
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    setPos((p) => (p.src === '설정' ? { lat: settings.lat, lon: settings.lon, src: '설정' } : p));
  }, [settings.lat, settings.lon]);
  const sp = sunPosition(pos.lat, pos.lon, now);
  const noon = sp.solarNoon;
  const noonAlt = sunPosition(pos.lat, pos.lon, noon).altitude;
  const useDevice = () => {
    if (!navigator.geolocation) {
      setGeoErr('이 기기는 위치를 알 수 없어요.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (g) => setPos({ lat: g.coords.latitude, lon: g.coords.longitude, src: '기기' }),
      () => setGeoErr('위치 권한이 없어요. 설정값을 써요.'),
      { timeout: 8000 },
    );
  };
  const dir = sp.azimuth < 180 ? '남동' : sp.azimuth > 180 ? '남서' : '남';
  return (
    <div className="card soft" style={{ padding: 16 }}>
      <h4>☀️ 태양 높이 계산기</h4>
      <div className="row" style={{ alignItems: 'baseline' }}>
        <span className="num" style={{ fontSize: compact ? 28 : 40, fontWeight: 700 }}>
          {sp.altitude < 0 ? '해가 졌어요' : `약 ${Math.round(sp.altitude)}°`}
        </span>
        {sp.altitude >= 0 && (
          <span className="small muted">
            방향 {dir}쪽(방위 {Math.round(sp.azimuth)}°) · 남중 {noon.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}에 약 {Math.round(noonAlt)}°
          </span>
        )}
      </div>
      <p className="tiny muted" style={{ margin: '6px 0' }}>
        위치: {pos.src} (위도 {pos.lat.toFixed(2)}, 경도 {pos.lon.toFixed(2)}) · {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준 · 오차 1° 안팎
      </p>
      <div className="row">
        <button type="button" className="btn sm" onClick={useDevice}>
          기기 위치 사용
        </button>
        {pos.src === '기기' && (
          <button type="button" className="btn sm text" onClick={() => setPos({ lat: settings.lat, lon: settings.lon, src: '설정' })}>
            설정값으로
          </button>
        )}
        {geoErr && <span className="tiny muted">{geoErr}</span>}
      </div>
    </div>
  );
}

export function useSunAltitude(): number {
  const { settings } = useSession();
  const [alt, setAlt] = useState(() => sunPosition(settings.lat, settings.lon, new Date()).altitude);
  useEffect(() => {
    const tick = () => setAlt(sunPosition(settings.lat, settings.lon, new Date()).altitude);
    tick();
    const t = window.setInterval(tick, 60000);
    return () => window.clearInterval(t);
  }, [settings.lat, settings.lon]);
  return alt;
}
