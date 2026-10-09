// 실험 단계 공통 화면(7장): 왼쪽 「지금 할 일」+조건 목록, 가운데 실시간 값+측정 버튼, 아래 ON 표
import { useEffect, useMemo, useState } from 'react';
import { Figure } from '../../components/Figure';
import { OnDataTable } from '../../components/OnDataTable';
import { Rich } from '../../components/Rich';
import { ShadowCalc } from '../../components/ShadowCalc';
import { useSunAltitude } from '../../components/SunCalc';
import { measureGuide } from '../../content/sensorsGuide';
import { summarize } from '../../lib/analysis';
import { fmt } from '../../lib/calc';
import { checkGuards, tempPhaseHint } from '../../lib/guards';
import { EXP_META, conditionValue, nextCondition, type Condition, type ExpKey, type Trial } from '../../lib/model';
import { tiltAdvice } from '../../lib/shadow';
import { sensors } from '../../sensors/manager';
import { useSensors } from '../../sensors/useSensors';
import { useSession } from '../../state/SessionContext';
import { DemoControls, ManualInputs } from './Inputs';
import { LiveTiles } from './LiveTiles';
import { useMeasurement } from './useMeasurement';

export function ExperimentPanel({ expKey }: { expKey: ExpKey }) {
  const { session, update, settings, setSettings } = useSession();
  const { latest, roles } = useSensors();
  const { state, measure, cancel } = useMeasurement();
  const exp = session.experiments[expKey];
  const meta = EXP_META[expKey];
  const firstOpen = exp.conditions.findIndex((c) => c.trials.length < 3);
  const [activeId, setActiveId] = useState<string>(exp.conditions[firstOpen === -1 ? 0 : firstOpen].id);
  const active = exp.conditions.find((c) => c.id === activeId) ?? exp.conditions[0];
  const sunAlt = useSunAltitude();
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!exp.conditions.some((c) => c.id === activeId)) setActiveId(exp.conditions[0].id);
  }, [exp.conditions, activeId]);

  // 연습 값이 실제 기록에 섞이는 경로 차단
  const demoMismatch = !session.demo && sensors.anyDemo();
  const energyReady = roles.energy.status === 'connected';

  const guard = checkGuards(exp.baseline, { G: latest.G, T: latest.T }, exp.startedAt, Date.now());
  const guardMsgs: string[] = [];
  if (expKey !== 'irr' && guard.irrChanged) guardMsgs.push(`햇빛 세기가 달라졌어요(구름?) — 처음보다 ${guard.irrPct! > 0 ? '+' : ''}${guard.irrPct!.toFixed(0)}%. 잠깐 기다렸다가 다시 재는 게 좋아요.`);
  if (expKey !== 'temp' && guard.tempChanged) guardMsgs.push(`온도가 달라졌어요(통제 변인) — 처음보다 ${guard.tempDiff! > 0 ? '+' : ''}${guard.tempDiff!.toFixed(1)} ℃. 특이사항에 자동으로 적어 둘게요.`);
  if (expKey === 'angle' && guard.sunMoved) guardMsgs.push('실험을 시작한 지 20분이 넘었어요. 태양이 움직였어요. 방향을 다시 맞추세요.');

  // 온도 실험 구간 안내
  const T1 = expKey === 'temp' ? exp.conditions[0]?.trials[0]?.T : undefined;
  const phase = expKey === 'temp' ? tempPhaseHint(T1, sensors.recentTemps()) : '';

  const record = async (replaceIndex?: number) => {
    if (demoMismatch) {
      setNotice('연습 센서가 연결되어 있어요. 연습 값은 실제 기록에 넣을 수 없어요. 상단의 「연습 모드」로 바꾸거나 실제 센서를 연결하세요.');
      return;
    }
    setNotice('');
    const trial = await measure();
    if (!trial) return;
    const alerts: string[] = [];
    if (expKey !== 'irr' && guard.irrChanged) alerts.push(`측정 중 ${guard.irrPct! < 0 ? '구름으로 ' : ''}일사량 ${Math.abs(guard.irrPct!).toFixed(0)}% ${guard.irrPct! < 0 ? '감소' : '증가'}`);
    if (expKey !== 'temp' && guard.tempChanged) alerts.push(`측정 중 패널 온도 ${guard.tempDiff! > 0 ? '+' : ''}${guard.tempDiff!.toFixed(1)}℃ 변화`);
    update((s) => {
      const e = s.experiments[expKey];
      const conds = e.conditions.map((c) => {
        if (c.id !== active.id) return c;
        const trials = [...c.trials];
        if (replaceIndex !== undefined && replaceIndex < trials.length) trials[replaceIndex] = trial;
        else trials.push(trial);
        // 같은 종류(일사량/온도)의 알림은 하나만 남긴다(최근 값으로 교체)
        const kindOf = (a: string) => (a.includes('일사량') ? 'G' : a.includes('온도') ? 'T' : a);
        const merged = c.alerts.filter((a) => !alerts.some((n) => kindOf(n) === kindOf(a)));
        merged.push(...alerts);
        return { ...c, trials, alerts: merged };
      });
      const baseline = e.baseline ?? { G: trial.G, T: trial.T };
      return { ...s, experiments: { ...s.experiments, [expKey]: { ...e, conditions: conds, baseline, startedAt: e.startedAt ?? trial.t } } };
    });
    // 3회가 끝나면 다음 조건으로
    if (replaceIndex === undefined && active.trials.length + 1 >= 3) {
      const idx = exp.conditions.findIndex((c) => c.id === active.id);
      const next = exp.conditions.slice(idx + 1).find((c) => c.trials.length < 3);
      if (next) setActiveId(next.id);
    }
  };

  const removeTrial = (c: Condition, i: number) => {
    if (!confirm(`${c.label}의 ${i + 1}회 기록을 지울까요?`)) return;
    update((s) => {
      const e = s.experiments[expKey];
      return { ...s, experiments: { ...s.experiments, [expKey]: { ...e, conditions: e.conditions.map((x) => (x.id === c.id ? { ...x, trials: x.trials.filter((_, j) => j !== i) } : x)) } } };
    });
  };

  const addCondition = () => {
    if (exp.conditions.length >= 5) return;
    update((s) => {
      const e = s.experiments[expKey];
      return { ...s, experiments: { ...s.experiments, [expKey]: { ...e, conditions: [...e.conditions, nextCondition(expKey, e.conditions)] } } };
    });
  };
  const removeCondition = (c: Condition) => {
    if (exp.conditions.length <= 2) return;
    if (c.trials.length && !confirm(`${c.label} 조건과 기록 ${c.trials.length}개를 지울까요?`)) return;
    update((s) => {
      const e = s.experiments[expKey];
      return { ...s, experiments: { ...s.experiments, [expKey]: { ...e, conditions: e.conditions.filter((x) => x.id !== c.id) } } };
    });
  };
  const setAngle = (c: Condition, deg: number, measured: boolean) => {
    update((s) => {
      const e = s.experiments[expKey];
      return {
        ...s,
        experiments: {
          ...s.experiments,
          [expKey]: {
            ...e,
            conditions: e.conditions.map((x) => (x.id === c.id ? (measured ? { ...x, measuredValue: deg } : { ...x, target: deg, label: `${deg}°`, measuredValue: undefined }) : x)),
          },
        },
      };
    });
  };

  const sums = useMemo(() => summarize(expKey, exp), [expKey, exp]);
  const activeSum = sums.find((s) => s.id === active.id);
  const todo = todoLines(expKey, active, phase);
  const manipKey = expKey === 'irr' ? 'G' : expKey === 'temp' ? 'T' : 'angle';
  // 연습 모드 「이 조건으로 맞추기」: 조작 변인만 바꾸고 나머지는 기본 자세(통제 변인)로
  const demoPreset =
    expKey === 'irr'
      ? { layers: active.target ?? 0, angleDeg: 90, label: active.label }
      : expKey === 'angle'
        ? { angleDeg: active.target ?? 90, layers: 0, label: active.label }
        : { T: active.label === '차갑게' ? 12 : active.label === '중간' ? 28 : 45, layers: 0, angleDeg: 90, label: active.label };

  return (
    <div>
      <div className="todo">
        {meta.title} — 지금 할 일: <span style={{ color: 'var(--primary)' }}>{active.label}</span> {active.trials.length < 3 ? `${active.trials.length + 1}회 측정` : '완료 ✓'}
      </div>
      {demoMismatch && <div className="alert warn">연습 센서가 연결되어 있는데 실제 모드예요. 연습 값은 기록되지 않아요. 상단 띠에서 모드를 확인하세요.</div>}
      {guardMsgs.map((m) => (
        <div key={m} className="alert warn">
          🛡 {m}
        </div>
      ))}
      {expKey === 'temp' && phase === 'mid' && active.label === '중간' && <div className="alert ok">🌡 중간 구간이에요 — 측정하세요</div>}
      {expKey === 'temp' && phase === 'hot' && <div className="alert ok">🌡 온도가 더 오르지 않아요 — 「뜨겁게」를 측정하세요</div>}

      <div className="measure-grid">
        <div className="stack">
          <div className="card" style={{ padding: 16 }}>
            <h4>📌 이 조건에서 할 일</h4>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {todo.map((t, i) => (
                <li key={i}>
                  <Rich text={t} />
                </li>
              ))}
            </ol>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <h4>조건 ({exp.conditions.length}/5)</h4>
            <ul className="cond-list">
              {exp.conditions.map((c) => {
                const s = sums.find((x) => x.id === c.id);
                return (
                  <li key={c.id} className={`${c.id === active.id ? 'active' : ''} ${c.trials.length >= 3 ? 'done' : ''}`} onClick={() => setActiveId(c.id)}>
                    <span>
                      <b>{c.label}</b>
                      {s && s.value !== undefined && c.trials.length > 0 && (
                        <span className="tiny muted">
                          {' '}
                          · 평균 {expKey === 'angle' ? `${Math.round(s.value)}°` : `${fmt(s.value, 1)} ${meta.unit}`}
                        </span>
                      )}
                    </span>
                    <span className="dots" aria-label={`${c.trials.length}/3회`}>
                      {[0, 1, 2].map((i) => (
                        <i key={i} className={c.trials[i] ? 'on' : ''} />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="row">
              <button type="button" className="btn sm" onClick={addCondition} disabled={exp.conditions.length >= 5}>
                + 조건 추가
              </button>
              <button type="button" className="btn sm text" onClick={() => removeCondition(active)} disabled={exp.conditions.length <= 2}>
                이 조건 지우기
              </button>
            </div>
            {expKey === 'angle' && (
              <div style={{ marginTop: 10 }}>
                <label className="field">
                  목표 각도(°)
                  <input type="number" min={0} max={90} step={5} value={active.target ?? 90} onChange={(e) => setAngle(active, Math.max(0, Math.min(90, +e.target.value)), false)} />
                </label>
                {active.measuredValue !== undefined && (
                  <p className="small">
                    실측 각도 <b className="num">{active.measuredValue}°</b>로 기록돼요.{' '}
                    <button type="button" className="btn sm text" onClick={() => setAngle(active, active.target ?? 90, false)}>
                      목표값으로 되돌리기
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
          {expKey === 'angle' && (
            <div className="card soft" style={{ padding: 14 }}>
              <h4>🎯 각도 맞춤 도우미 — {active.label}</h4>
              <p className="small">
                막대 그림자가 <b>위아래(기울이는 방향)로만</b> 생기도록 좌우 방향을 먼저 맞추세요.
              </p>
              <p className="small">
                지금 태양 높이 약 {Math.round(sunAlt)}° → <b>{tiltAdvice(active.target ?? 90, sunAlt)}</b>
              </p>
              <ShadowCalc
                pinHeightCm={session.pinHeightCm || settings.pinHeightCm}
                onPinChange={(h) => {
                  update((s) => ({ ...s, pinHeightCm: h }));
                  setSettings({ ...settings, pinHeightCm: h });
                }}
                targets={[active.target ?? 90]}
                onMeasured={(deg) => setAngle(active, deg, true)}
              />
            </div>
          )}
        </div>

        <div className="stack">
          <LiveTiles manip={manipKey} />
          <ManualInputs />
          <DemoControls preset={demoPreset} />
          <div className="card" style={{ padding: 16 }}>
            {state.running ? (
              <div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b style={{ fontSize: 20 }}>측정 중… {state.remainingSec}초</b>
                  <button type="button" className="btn sm" onClick={cancel}>
                    취소
                  </button>
                </div>
                <div className="progress" style={{ marginTop: 8 }}>
                  <div style={{ width: `${state.progress * 100}%` }} />
                </div>
              </div>
            ) : (
              <button type="button" className="btn primary huge block" disabled={!energyReady || active.trials.length >= 3} onClick={() => record()}>
                {active.trials.length >= 3 ? `${active.label} 완료 ✓` : `${active.trials.length + 1}회 측정${guardMsgs.length ? ' (그래도 기록)' : ''}`}
              </button>
            )}
            {!energyReady && <div className="alert warn">에너지 센서가 연결되어야 측정할 수 있어요. 「연결」 단계로 돌아가세요.</div>}
            {state.error && <div className="alert warn">{state.error}</div>}
            {notice && <div className="alert warn">{notice}</div>}
            <div style={{ marginTop: 10 }}>
              {active.trials.map((t, i) => (
                <TrialRow key={t.t} t={t} i={i} onRedo={() => record(i)} onRemove={() => removeTrial(active, i)} />
              ))}
              {activeSum && active.trials.length >= 3 && (
                <div className="alert ok">
                  {active.label} 평균: 전압 {fmt(activeSum.meanV, 2)} V · 전류 {fmt(activeSum.meanI, 3)} A · 전력 <b>{fmt(activeSum.meanP, 3)} W</b>
                  {activeSum.value !== undefined && ` · ${meta.short} ${expKey === 'angle' ? `${Math.round(activeSum.value)}°` : `${fmt(activeSum.value, 1)} ${meta.unit}`}`}
                </div>
              )}
            </div>
          </div>
          {expKey === 'irr' && <Figure slot="gen/shade-layers.png" caption="가림막 겹 수로 일사량 바꾸기" />}
          {expKey === 'angle' && (
            <div className="grid-2">
              <Figure slot="gen/shadow-pin.png" caption="수직 막대의 그림자로 각도 재기" />
              <Figure slot="photo/shadow-pin-real.jpg" caption="수직 막대와 그림자(예시 이미지)" />
            </div>
          )}
          {expKey === 'temp' && <Figure slot="gen/cooling-panel.png" caption="얼음팩으로 태양 전지 식히기" />}
        </div>
      </div>

      <h3 style={{ marginTop: 20 }}>기록표 (ON 표 모양)</h3>
      <OnDataTable expKey={expKey} session={session} showHelp={false} />
    </div>
  );
}

function TrialRow({ t, i, onRedo, onRemove }: { t: Trial; i: number; onRedo: () => void; onRemove: () => void }) {
  return (
    <div className="trial-row">
      <b>{i + 1}회</b>
      <span className="num">{fmt(t.V, 2)} V</span>
      <span className="num">{fmt(t.I, 3)} A</span>
      <span className="num">
        <b>{fmt(t.P, 3)} W</b>
      </span>
      {t.G !== undefined && <span className="num muted">{fmt(t.G, 0)} W/m²</span>}
      {t.T !== undefined && <span className="num muted">{fmt(t.T, 1)} ℃</span>}
      {t.unstable && <span className="badge yellow">흔들림</span>}
      {t.source !== 'sensor' && <span className="badge">{t.source === 'demo' ? '연습' : '직접 입력'}</span>}
      <span style={{ marginLeft: 'auto' }} className="row">
        <button type="button" className="btn sm" onClick={onRedo}>
          다시 재기
        </button>
        <button type="button" className="btn sm text" onClick={onRemove}>
          지우기
        </button>
      </span>
    </div>
  );
}

function todoLines(key: ExpKey, c: Condition, phase: '' | 'mid' | 'hot'): string[] {
  if (key === 'irr') return measureGuide.exp1.todo.map((t) => t.replace('{n}', String(c.target ?? 0)));
  if (key === 'angle') {
    const v = conditionValue('angle', c);
    return [`목표: 태양 빛과 태양 전지 면이 **${v ?? 90}°**가 되게 독서대를 기울여요.`, ...measureGuide.exp2.todo];
  }
  if (c.label === '차갑게') return [measureGuide.exp3.todo[0], measureGuide.exp3.todo[1]];
  if (c.label === '중간') return [measureGuide.exp3.todo[2], phase === 'mid' ? '지금이 중간 구간이에요 — 1·2·3회를 이어서 재요.' : '온도가 8 ℃쯤 오를 때까지 기다려요. 원하면 언제든 잴 수 있어요.'];
  if (c.label === '뜨겁게') return [measureGuide.exp3.todo[3], phase === 'hot' ? '지금 온도 상승이 멈췄어요 — 1·2·3회를 이어서 재요.' : '1분 동안 1 ℃ 미만으로 변할 때까지 기다려요.'];
  return ['이 조건에서 값이 안정되면 1·2·3회를 재요.'];
}
