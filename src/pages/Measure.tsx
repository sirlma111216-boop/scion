// 측정 도우미(7장): 단계형 마법사. 준비 → 연결 → 부하 → 실험 1 → 실험 2 → 실험 3 → 마무리 (+ 확인 측정, 시설 측정)
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { completion } from '../lib/analysis';
import { sensors } from '../sensors/manager';
import { useSensors } from '../sensors/useSensors';
import { useSession } from '../state/SessionContext';
import { ExperimentPanel } from './measure/ExperimentPanel';
import { StepConfirm, StepConnect, StepFacility, StepFinish, StepLoad, StepPrepare } from './measure/Steps';

const STEPS = ['준비', '연결', '부하', '실험 1 일사량', '실험 2 각도', '실험 3 온도', '마무리'];

export function Measure() {
  const { session, update } = useSession();
  const { roles } = useSensors();
  const [params, setParams] = useSearchParams();
  const paramStep = params.get('step');
  const step = paramStep !== null ? Math.max(0, Math.min(8, parseInt(paramStep, 10) || 0)) : session.step;

  const goto = (n: number) => {
    update((s) => ({ ...s, step: n }));
    setParams(n >= 7 ? { step: String(n) } : {});
    window.scrollTo({ top: 0 });
  };

  // 측정 중 화면 꺼짐 방지, 페이지를 떠날 때 센서 닫기
  useEffect(() => {
    sensors.requestWakeLock();
    const onHide = () => sensors.disconnectAll();
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      sensors.disconnectAll();
    };
  }, []);

  const comp = completion(session);
  const connected = Object.values(roles).filter((r) => r.status === 'connected').length;
  const doneFlags = [
    !!(session.weather.tempC || session.weather.sky),
    connected === 3,
    !!session.load,
    comp.irr.missing.length === 0,
    comp.angle.missing.length === 0,
    comp.temp.missing.length === 0,
    false,
  ];

  // 다음으로 넘어가기 전 알려 주기(막지는 않는다)
  const warnBeforeNext = (): string | null => {
    if (step === 1 && connected < 3) return `센서가 ${connected}/3개만 연결됐어요.`;
    if (step === 2 && !session.load) return '부하를 아직 기록하지 않았어요.';
    if (step >= 3 && step <= 5) {
      const k = (['irr', 'angle', 'temp'] as const)[step - 3];
      if (comp[k].missing.length) return `아직 안 잰 회차가 있어요: ${comp[k].missing.join(', ')}`;
    }
    return null;
  };
  const next = () => {
    const w = warnBeforeNext();
    if (w && !confirm(`${w}\n그래도 다음 단계로 갈까요?`)) return;
    goto(Math.min(6, step + 1));
  };

  return (
    <div className="stack">
      <div>
        <div className="step-badge">3단계 · 측정 도우미</div>
        <h1 style={{ marginBottom: 4 }}>측정 도우미</h1>
        <p className="muted small">야외 모드 — 어느 단계든 건너뛰거나 되돌아갈 수 있고, 진행 상황은 자동 저장돼요.</p>
      </div>
      <div className="wizard-steps no-print" role="tablist">
        {STEPS.map((s, i) => (
          <button key={s} type="button" role="tab" aria-selected={step === i} className={`${step === i ? 'active' : ''} ${doneFlags[i] ? 'done' : ''}`} onClick={() => goto(i)}>
            <span>{i + 1}</span> {s} {doneFlags[i] && '✓'}
          </button>
        ))}
        <button type="button" className={step === 7 ? 'active' : ''} onClick={() => goto(7)}>
          확인 측정
        </button>
        <button type="button" className={step === 8 ? 'active' : ''} onClick={() => goto(8)}>
          시설 측정
        </button>
      </div>

      {step === 0 && <StepPrepare />}
      {step === 1 && <StepConnect />}
      {step === 2 && <StepLoad />}
      {step === 3 && <ExperimentPanel key="irr" expKey="irr" />}
      {step === 4 && <ExperimentPanel key="angle" expKey="angle" />}
      {step === 5 && <ExperimentPanel key="temp" expKey="temp" />}
      {step === 6 && <StepFinish goto={goto} />}
      {step === 7 && <StepConfirm />}
      {step === 8 && <StepFacility />}

      {step === 4 && (
        <div className="helper easy">
          <div className="h">
            <span>🔁</span> 실험 2 준비
          </div>
          일사량 센서를 판에서 떼어 <b>태양을 정면으로 향한 채 따로 고정</b>해요(작은 받침에 붙여 그림자 막대로 맞춤). 이 실험에서 일사량 센서는 「햇빛 세기가 그대로인지」 지켜보는 역할이에요. 태양 전지만 기울여요.
        </div>
      )}
      {step === 5 && (
        <div className="helper easy">
          <div className="h">
            <span>🔁</span> 실험 3 준비
          </div>
          일사량 센서를 다시 판에 붙이고 기본 자세(90°)로 놓아요.
        </div>
      )}

      <div className="row no-print" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <button type="button" className="btn big" disabled={step === 0} onClick={() => goto(Math.max(0, step >= 7 ? 6 : step - 1))}>
          ← 이전
        </button>
        {step < 6 ? (
          <button type="button" className="btn primary big" onClick={next}>
            다음: {STEPS[step + 1]} →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
