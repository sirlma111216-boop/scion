import { useSyncExternalStore } from 'react';
import { sensors } from './manager';

let snapshotVersion = 0;
let snapshot = { roles: sensors.roles, latest: sensors.latest, version: 0 };

sensors.subscribe(() => {
  snapshotVersion += 1;
  snapshot = { roles: sensors.roles, latest: sensors.latest, version: snapshotVersion };
});

/** 센서 상태와 최신 값을 React 에서 구독 */
export function useSensors() {
  return useSyncExternalStore(
    (cb) => sensors.subscribe(cb),
    () => snapshot,
    () => snapshot,
  );
}
