// 태양 고도 계산(NOAA 근사식). 오차 1° 안팎이면 충분하다.
const DEG = Math.PI / 180;

function toJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export interface SunPosition {
  altitude: number; // 고도(°)
  azimuth: number; // 방위각(°, 북=0, 동=90)
  solarNoon: Date; // 남중 시각
  declination: number;
}

/** 위도·경도(°E)·시각으로 태양 위치 */
export function sunPosition(lat: number, lon: number, date: Date): SunPosition {
  const jd = toJulianDay(date);
  const jc = (jd - 2451545) / 36525;
  const L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const C =
    Math.sin(M * DEG) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(2 * M * DEG) * (0.019993 - 0.000101 * jc) +
    Math.sin(3 * M * DEG) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * jc;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  const eps0 = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * DEG);
  const decl = Math.asin(Math.sin(eps * DEG) * Math.sin(lambda * DEG)) / DEG;
  const y = Math.tan((eps / 2) * DEG) ** 2;
  const eqTime =
    4 *
    (y * Math.sin(2 * L0 * DEG) -
      2 * e * Math.sin(M * DEG) +
      4 * e * y * Math.sin(M * DEG) * Math.cos(2 * L0 * DEG) -
      0.5 * y * y * Math.sin(4 * L0 * DEG) -
      1.25 * e * e * Math.sin(2 * M * DEG)) /
    DEG; // 분

  // 그 날의 UTC 자정부터 지난 분
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const trueSolarMinutes = (utcMinutes + eqTime + 4 * lon + 1440) % 1440;
  let hourAngle = trueSolarMinutes / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;

  const cosZenith =
    Math.sin(lat * DEG) * Math.sin(decl * DEG) + Math.cos(lat * DEG) * Math.cos(decl * DEG) * Math.cos(hourAngle * DEG);
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith))) / DEG;
  const altitude = 90 - zenith;

  let azimuth: number;
  const denom = Math.cos(lat * DEG) * Math.sin(zenith * DEG);
  if (Math.abs(denom) < 1e-9) azimuth = 180;
  else {
    const cosAz = (Math.sin(lat * DEG) * Math.cos(zenith * DEG) - Math.sin(decl * DEG)) / denom;
    const az = Math.acos(Math.max(-1, Math.min(1, cosAz))) / DEG;
    azimuth = hourAngle > 0 ? (az + 180) % 360 : (540 - az) % 360;
  }

  // 남중 시각(UTC 분) = 720 − 4·lon − eqTime
  const noonUtcMinutes = 720 - 4 * lon - eqTime;
  const dayStartUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const solarNoon = new Date(dayStartUtc + noonUtcMinutes * 60000);

  return { altitude, azimuth, solarNoon, declination: decl };
}

/** 그 날 남중 고도(°) */
export function noonAltitude(lat: number, lon: number, date: Date): number {
  const { solarNoon } = sunPosition(lat, lon, date);
  return sunPosition(lat, lon, solarNoon).altitude;
}
