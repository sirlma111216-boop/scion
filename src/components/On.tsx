// 지능형 과학실 ON 을 닮게 만드는 요소들(2-1). 모양만 흉내 낸 것이며 실제 저장은 ON 에서 한다.
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { config } from '../content/config';
import { useSession } from '../state/SessionContext';

export const SIDEBAR = [
  {
    group: '탐구계획',
    items: [
      { to: '/my/1/1', label: '활동 1. 문제인식', ids: ['1-1-1a', '1-1-1b', '1-1-2', '1-2-1', '1-2-4'] },
      { to: '/my/2/1', label: '활동 2. 측정할 데이터 및 도구선정', ids: ['2-1-1', '2-1-4', '2-1-5', '2-1-7v', '2-1-7i', '2-2-1'] },
    ],
  },
  {
    group: '탐구수행',
    items: [
      { to: '/my/3/1', label: '활동 3. 데이터수집', ids: ['3-1-1', '3-1-2', '3-1-3'] },
      { to: '/my/4/1', label: '활동 4. 데이터 분석 및 결론도출', ids: ['4-1-2', '4-1-4', '4-2-1', '4-3-1', '4-3-2', '4-3-3'] },
    ],
  },
  { group: '탐구평가', items: [{ to: '/my/5/1', label: '활동 5. 상호평가', ids: ['5-1-1', '5-1-2'] }] },
  { group: '탐구토론', items: [{ to: '/my/talk', label: '토론방', ids: [] }] },
];

export function OnSidebar({ activePrefix }: { activePrefix: string }) {
  const { progress } = useSession();
  return (
    <nav className="on-side" aria-label="ON 활동 목록">
      {SIDEBAR.map((g) => (
        <div key={g.group}>
          <div className="group">{g.group}</div>
          {g.items.map((it) => {
            const done = it.ids.filter((id) => progress[id]).length;
            const active = activePrefix.startsWith(it.to.replace(/\/\d+$/, '')) && activePrefix.split('/')[2] === it.to.split('/')[2];
            return (
              <NavLink key={it.to} to={it.to} className={active ? 'active' : ''}>
                <span>{it.label}</span>
                {it.ids.length > 0 && (
                  <span className="prog">
                    {done}/{it.ids.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** 탐구명 줄 + 정보 줄 + 사이드바 + 본문 */
export function OnFrame({ path, section, activity, children }: { path: string; section: string; activity: string; children: ReactNode }) {
  return (
    <div className="on-frame">
      <div className="on-title">
        <span className="on-tag">탐구명</span>
        <strong>우리는 체인지메이커! 학교(지역)의 태양광 발전량을 늘리자!</strong>
      </div>
      <div className="on-info">· 심화 탐구 : 조건(일사량, 각도, 온도)에 따른 태양 전지의 발전량(생산 전력)을 측정하고 가장 효율적인 조건을 찾아보기</div>
      <div className="on-body">
        <OnSidebar activePrefix={path} />
        <div className="on-main">
          <div className="on-h1">{section}</div>
          <div className="on-h2">{activity}</div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function OnDropdown({ children }: { children: ReactNode }) {
  return <div className="on-dropdown">{children}</div>;
}

export function OnQ({ n, children, sub }: { n: number | string; children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="on-q">
      {n} . {children}
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function OnBox({ children }: { children: ReactNode }) {
  return <div className="on-box">{children}</div>;
}

/** ON 입력 칸 모양(비어 있음) */
export function OnInput({ tall, placeholder = '', children }: { tall?: boolean; placeholder?: string; children?: ReactNode }) {
  return <div className={`on-input ${tall ? 'tall' : ''}`}>{children ?? placeholder}</div>;
}

/** 누르면 「여기는 안내 화면이에요」 말풍선이 뜨는 가짜 버튼 */
export function FakeTip({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setShow(false), 2500);
    return () => window.clearTimeout(t);
  }, [show]);
  return (
    <span className="fake-tip" onClick={() => setShow(true)} role="presentation">
      {children}
      {show && <span className="tip">여기는 안내 화면이에요. 실제 저장은 지능형 과학실 ON에서 해요.</span>}
    </span>
  );
}

export function OnUploadButton() {
  return (
    <FakeTip>
      <button type="button" className="on-upload">
        이미지 업로드
      </button>
    </FakeTip>
  );
}

export function OnSaveButton({ label = '저장' }: { label?: string }) {
  return (
    <div className="on-save-row">
      <FakeTip>
        <button type="button" className="on-save">
          {label}
        </button>
      </FakeTip>
    </div>
  );
}

export function OnLink() {
  return (
    <a className="btn primary sm" href={config.scienceOnUrl} target="_blank" rel="noreferrer">
      지능형 과학실 ON 바로가기 ↗
    </a>
  );
}
