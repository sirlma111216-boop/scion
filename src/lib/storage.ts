// localStorage 저장. 실제 데이터(scion:v1)와 연습 데이터(scion:demo)는 키를 완전히 분리한다.
import { emptySession, type Session } from './model';

export const REAL_KEY = 'scion:v1';
export const DEMO_KEY = 'scion:demo';
export const MODE_KEY = 'scion:mode';
export const SETTINGS_KEY = 'scion:settings';
export const PROGRESS_KEY = 'scion:progress';
export const TEACHER_KEY = 'scion:teacher';
export const SURVEY_KEY = 'scion:survey';

export function storageKeyFor(demo: boolean): string {
  return demo ? DEMO_KEY : REAL_KEY;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 저장 공간 부족 등은 조용히 무시 */
  }
}

export function loadSession(demo: boolean): Session {
  const raw = safeGet(storageKeyFor(demo));
  if (!raw) return emptySession(demo);
  try {
    const s = JSON.parse(raw) as Session;
    if (s.version !== 1) return emptySession(demo);
    // 연습 플래그는 저장 키가 결정한다(연습 값이 실제 키에 섞이지 않게)
    return { ...s, demo };
  } catch {
    return emptySession(demo);
  }
}

export function saveSession(session: Session): void {
  // demo 플래그와 저장 키가 반드시 일치해야 한다.
  safeSet(storageKeyFor(session.demo), JSON.stringify(session));
}

export function clearSession(demo: boolean): void {
  try {
    localStorage.removeItem(storageKeyFor(demo));
  } catch {
    /* 무시 */
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): void {
  safeSet(key, JSON.stringify(value));
}

export function loadMode(): boolean {
  return safeGet(MODE_KEY) === 'demo';
}
export function saveMode(demo: boolean): void {
  safeSet(MODE_KEY, demo ? 'demo' : 'real');
}
