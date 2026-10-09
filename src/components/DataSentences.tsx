import { dataSentence } from '../lib/analysis';
import { EXP_KEYS, type Session } from '../lib/model';
import { CopyButton } from './CopyButton';
import { DataBox, WarnBox } from './Helpers';

/** 내 데이터로 채운 문장(8-3) */
export function DataSentences({ session }: { session: Session }) {
  const items = EXP_KEYS.map((k) => dataSentence(k, session.experiments[k])).filter((d): d is NonNullable<typeof d> => !!d);
  const unexpected = items.some((d) => !d.asExpected);
  return (
    <DataBox>
      {session.demo && <span className="badge yellow">연습 — 가상 값</span>}
      {!items.length ? (
        <p className="small muted" style={{ margin: 0 }}>
          측정한 뒤에 채워져요. (조건 2개 이상, 조건마다 2회 이상 측정하면 문장이 만들어져요.)
        </p>
      ) : (
        <ul style={{ margin: 0 }}>
          {items.map((d) => (
            <li key={d.key}>
              {d.text} <CopyButton text={d.text} className="btn sm text" />
            </li>
          ))}
        </ul>
      )}
      {unexpected && (
        <WarnBox>
          예상과 다른 결과예요. 값을 고치지 말고, 원인이 될 만한 것(구름, 그림자, 온도 변화, 부하 손잡이를 건드림 등)을 특이사항과 활동 5에 적어요.
        </WarnBox>
      )}
    </DataBox>
  );
}
