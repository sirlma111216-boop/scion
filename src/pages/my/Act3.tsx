import { Link } from 'react-router-dom';
import { EasyCard } from '../../components/Helpers';
import { OnBox, OnDropdown, OnFrame, OnQ, OnSaveButton } from '../../components/On';
import { OnDataTable } from '../../components/OnDataTable';
import { act3 } from '../../content/act3';
import { useSession } from '../../state/SessionContext';

export function Act3P1() {
  const { session } = useSession();
  const qs = [
    { n: 1, key: 'irr' as const, q: act3.q1 },
    { n: 2, key: 'angle' as const, q: act3.q2 },
    { n: 3, key: 'temp' as const, q: act3.q3 },
  ];
  return (
    <OnFrame path="/my/3/1" section="탐구수행" activity="활동3. 데이터수집">
      <OnDropdown>{act3.dropdown}</OnDropdown>
      <div className="row no-print" style={{ marginBottom: 16 }}>
        <Link className="btn primary big" to="/measure">
          🔌 측정 도우미 열기
        </Link>
        <Link className="btn big" to="/results">
          📋 측정한 값 보기
        </Link>
      </div>
      <EasyCard>
        <p>{act3.easyWhy3}</p>
        <p style={{ margin: 0 }}>{act3.easyTable}</p>
      </EasyCard>
      {qs.map(({ n, key, q }) => (
        <div key={key}>
          <OnQ n={n}>{q.title}</OnQ>
          <OnBox>
            <ul>
              {act3.common.map((l) => (
                <li key={l}>{l}</li>
              ))}
              {q.extra.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </OnBox>
          <OnDataTable expKey={key} session={session} showHelp={false} />
        </div>
      ))}
      <OnSaveButton />
    </OnFrame>
  );
}
