import { fmt } from '../../lib/calc';
import { isStable } from '../../lib/guards';
import { sensors } from '../../sensors/manager';
import { useSensors } from '../../sensors/useSensors';
import { useSession } from '../../state/SessionContext';

/** 실시간 값 4개(전압·전류·전력·조작 변인) + 안정 표시 */
export function LiveTiles({ manip, bigPower }: { manip?: 'G' | 'T' | 'angle' | 'none'; bigPower?: boolean }) {
  const { latest } = useSensors();
  const { settings } = useSession();
  const powers = sensors.recentPowers(settings.windowSec);
  const hasP = latest.P !== undefined;
  const stable = hasP && isStable(powers);
  return (
    <div>
      <div className="live">
        <Tile label="전압" value={fmt(latest.V, 2)} unit="V" />
        <Tile label="전류" value={fmt(latest.I, 3)} unit="A" sub={latest.I !== undefined ? `${(latest.I * 1000).toFixed(0)} mA` : undefined} />
        <Tile label="전력" value={fmt(latest.P, 3)} unit="W" big={bigPower} />
        {manip === 'G' && <Tile label="일사량" value={fmt(latest.G, 0)} unit="W/m²" />}
        {manip === 'T' && <Tile label="표면 온도" value={fmt(latest.T, 1)} unit="℃" />}
        {manip === 'angle' && <Tile label="일사량(지킴이)" value={fmt(latest.G, 0)} unit="W/m²" />}
        {manip === undefined && (
          <>
            <Tile label="일사량" value={fmt(latest.G, 0)} unit="W/m²" />
            <Tile label="표면 온도" value={fmt(latest.T, 1)} unit="℃" />
          </>
        )}
      </div>
      {hasP ? (
        <div className={`stable ${stable ? 'ok' : 'no'}`}>{stable ? '✓ 값이 안정됐어요 — 측정하세요' : '~ 값이 흔들려요 — 잠깐 기다려요'}</div>
      ) : (
        <div className="stable none">— 에너지 센서 값이 아직 없어요</div>
      )}
    </div>
  );
}

function Tile({ label, value, unit, sub, big }: { label: string; value: string; unit: string; sub?: string; big?: boolean }) {
  return (
    <div className={`tile ${big ? 'big' : ''}`}>
      <div className="lbl">{label}</div>
      <div>
        <span className="val">{value}</span>
        <span className="unit">{unit}</span>
      </div>
      {sub && <div className="tiny muted num">{sub}</div>}
    </div>
  );
}
