// 측정 세션(실제/연습), 설정, 진행 표시를 한 곳에서. 모두 localStorage 에 자동 저장.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { config } from '../content/config';
import { type Session } from '../lib/model';
import { PROGRESS_KEY, SETTINGS_KEY, loadJson, loadMode, loadSession, saveJson, saveMode, saveSession } from '../lib/storage';

export interface Settings {
  team: string[];
  roles: string[]; // 설치/측정/입력/업로드 및 관리 순서로 담당 학생 인덱스 이름
  place: string;
  lat: number;
  lon: number;
  pinHeightCm: number;
  periodMs: number;
  windowSec: number;
}

export const defaultSettings = (): Settings => ({
  team: [...config.team],
  roles: ['설치', '측정', '입력', '업로드 및 관리'],
  place: config.location.name,
  lat: config.location.lat,
  lon: config.location.lon,
  pinHeightCm: config.pinHeightCm,
  periodMs: config.sampling.periodMs,
  windowSec: config.sampling.windowSec,
});

interface Ctx {
  session: Session;
  demo: boolean;
  setDemo: (demo: boolean) => void;
  update: (fn: (s: Session) => Session) => void;
  replace: (s: Session) => void;
  reset: () => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  progress: Record<string, boolean>;
  setDone: (id: string, done: boolean) => void;
  /** 공유 링크로 받은 읽기 전용 세션 */
  received: Session | null;
  setReceived: (s: Session | null) => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState<boolean>(() => loadMode());
  const [session, setSession] = useState<Session>(() => loadSession(loadMode()));
  const [settings, setSettingsState] = useState<Settings>(() => loadJson(SETTINGS_KEY, defaultSettings()));
  const [progress, setProgress] = useState<Record<string, boolean>>(() => loadJson(PROGRESS_KEY, {}));
  const [received, setReceived] = useState<Session | null>(null);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const setDemo = useCallback((d: boolean) => {
    saveMode(d);
    setDemoState(d);
    setSession(loadSession(d));
  }, []);

  const update = useCallback((fn: (s: Session) => Session) => setSession((s) => fn(s)), []);
  const replace = useCallback((s: Session) => setSession({ ...s, demo: loadMode() }), []);
  const reset = useCallback(() => {
    setSession((s) => {
      const fresh = loadSession(s.demo);
      return fresh;
    });
  }, []);

  const setSettings = useCallback((s: Settings) => {
    saveJson(SETTINGS_KEY, s);
    setSettingsState(s);
  }, []);

  const setDone = useCallback((id: string, done: boolean) => {
    setProgress((p) => {
      const next = { ...p, [id]: done };
      saveJson(PROGRESS_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ session, demo, setDemo, update, replace, reset, settings, setSettings, progress, setDone, received, setReceived }),
    [session, demo, setDemo, update, replace, reset, settings, setSettings, progress, setDone, received],
  );
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionCtx);
  if (!c) throw new Error('SessionProvider 밖에서 사용');
  return c;
}
