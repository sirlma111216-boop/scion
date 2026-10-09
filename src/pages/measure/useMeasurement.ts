// 측정 한 번(1회)의 정의(6-5): windowSec 동안 periodMs 간격으로 모아 평균.
import { useCallback, useEffect, useRef, useState } from 'react';
import { isStable } from '../../lib/guards';
import { mean } from '../../lib/calc';
import type { Source, Trial } from '../../lib/model';
import { sensors } from '../../sensors/manager';
import type { Sample } from '../../sensors/types';
import { useSession } from '../../state/SessionContext';

export interface WindowState {
  running: boolean;
  progress: number; // 0~1
  remainingSec: number;
  error: string | null;
}

export function useMeasurement() {
  const { settings } = useSession();
  const [state, setState] = useState<WindowState>({ running: false, progress: 0, remainingSec: 0, error: null });
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelRef.current?.(), []);

  const cancel = useCallback(() => {
    cancelRef.current?.();
  }, []);

  /** 측정 창을 열고 끝나면 Trial 을 돌려준다. 실패하면 null. */
  const measure = useCallback(
    (sourceOverride?: Source): Promise<Trial | null> =>
      new Promise((resolve) => {
        const windowMs = settings.windowSec * 1000;
        const Vs: number[] = [];
        const Is: number[] = [];
        const Gs: number[] = [];
        const Ts: number[] = [];
        const unstable = !isStable(sensors.recentPowers(settings.windowSec));
        const start = Date.now();
        let finished = false;
        const energyKind = sensors.kindOf('energy');
        const source: Source = sourceOverride ?? (sensors.anyDemo() ? 'demo' : energyKind === 'manual' ? 'manual' : 'sensor');

        const onSample = (s: Sample) => {
          if (s.V !== undefined && s.I !== undefined) {
            Vs.push(s.V);
            Is.push(s.I);
          }
          if (s.G !== undefined) Gs.push(s.G);
          if (s.T !== undefined) Ts.push(s.T);
        };
        const offSample = sensors.onSample(onSample);
        const offStatus = sensors.subscribe(() => {
          if (!sensors.isConnected('energy')) finish('측정 중 에너지 센서가 끊겼어요. 다시 연결하고 다시 재요.');
        });

        const tick = window.setInterval(() => {
          const el = Date.now() - start;
          setState({ running: true, progress: Math.min(1, el / windowMs), remainingSec: Math.max(0, Math.ceil((windowMs - el) / 1000)), error: null });
          if (el >= windowMs) finish(null);
        }, 100);

        function finish(err: string | null) {
          if (finished) return;
          finished = true;
          window.clearInterval(tick);
          offSample();
          offStatus();
          cancelRef.current = null;
          if (err) {
            setState({ running: false, progress: 0, remainingSec: 0, error: err });
            resolve(null);
            return;
          }
          if (Vs.length < 5) {
            setState({ running: false, progress: 0, remainingSec: 0, error: `표본이 ${Vs.length}개뿐이에요(5개 이상 필요). 센서 연결을 확인하고 다시 재요.` });
            resolve(null);
            return;
          }
          const V = mean(Vs);
          const I = mean(Is);
          const trial: Trial = {
            t: Date.now(),
            V,
            I,
            P: V * I,
            G: Gs.length ? mean(Gs) : undefined,
            T: Ts.length ? mean(Ts) : undefined,
            n: Vs.length,
            unstable,
            source,
          };
          setState({ running: false, progress: 1, remainingSec: 0, error: null });
          resolve(trial);
        }

        cancelRef.current = () => finish('측정을 취소했어요.');
        setState({ running: true, progress: 0, remainingSec: settings.windowSec, error: null });
      }),
    [settings.windowSec],
  );

  return { state, measure, cancel };
}
