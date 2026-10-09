import { describe, expect, it } from 'vitest';
import { noonAltitude, sunPosition } from './solar';

describe('태양 고도(위도 37.59, 경도 127.05, 2026-10-23 KST)', () => {
  const lat = 37.59;
  const lon = 127.05;
  const day = new Date('2026-10-23T03:00:00+09:00');
  it('남중 고도 40°~42°', () => {
    const alt = noonAltitude(lat, lon, day);
    expect(alt).toBeGreaterThanOrEqual(40);
    expect(alt).toBeLessThanOrEqual(42);
  });
  it('남중 시각 12:10~12:25 KST', () => {
    const { solarNoon } = sunPosition(lat, lon, day);
    const kstMinutes = ((solarNoon.getUTCHours() + 9) % 24) * 60 + solarNoon.getUTCMinutes();
    expect(kstMinutes).toBeGreaterThanOrEqual(12 * 60 + 10);
    expect(kstMinutes).toBeLessThanOrEqual(12 * 60 + 25);
  });
  it('밤에는 고도가 음수', () => {
    const { altitude } = sunPosition(lat, lon, new Date('2026-10-23T00:00:00+09:00'));
    expect(altitude).toBeLessThan(0);
  });
});
