import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_KEY, REAL_KEY, loadSession, saveSession } from './storage';
import { emptySession } from './model';

// 간단한 localStorage 대체
const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe('연습 데이터 분리', () => {
  it('연습 세션은 실제 키에 쓰이지 않는다', () => {
    const demo = emptySession(true);
    demo.experiments.irr.conditions[0].trials = [{ t: 0, V: 1, I: 1, P: 1, n: 10, unstable: false, source: 'demo' }];
    saveSession(demo);
    expect(store.has(DEMO_KEY)).toBe(true);
    expect(store.has(REAL_KEY)).toBe(false);
    expect(loadSession(false).experiments.irr.conditions[0].trials).toHaveLength(0);
  });
  it('실제 키에서 읽은 세션은 demo=false 로 강제', () => {
    const s = emptySession(false);
    (s as { demo: boolean }).demo = true; // 잘못된 플래그가 들어 있어도
    store.set(REAL_KEY, JSON.stringify(s));
    expect(loadSession(false).demo).toBe(false);
  });
});
