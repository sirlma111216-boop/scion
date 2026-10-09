import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { config } from '../content/config';
import { useSession } from '../state/SessionContext';
import { OnLink } from './On';

const NAV = [
  { to: '/topic', label: '주제 알아보기' },
  { to: '/my/1/1', label: '나의 공동탐구', match: '/my' },
  { to: '/measure', label: '측정 도우미' },
  { to: '/results', label: '결과 정리' },
  { to: '/library', label: '자료실' },
  { to: '/teacher', label: '선생님' },
];

export function Layout() {
  const { demo, setDemo } = useSession();
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);
  return (
    <>
      <header className="topnav">
        <div className="container">
          <NavLink to="/" className="brand">
            <span className="logo" />
            <span>태양광 체인지메이커</span>
          </NavLink>
          <nav className="navlinks" aria-label="주 메뉴">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive || (n.match && loc.pathname.startsWith(n.match)) ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {demo && (
        <div className="demo-band">
          🎮 연습 모드 — 가상 값이에요. 실제 측정 기록과 완전히 따로 저장돼요.{' '}
          <button type="button" className="btn sm dark" style={{ marginLeft: 8 }} onClick={() => setDemo(false)}>
            실제 모드로
          </button>
        </div>
      )}
      <main className="page">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="disclaimer">
        <div className="container row" style={{ justifyContent: 'space-between' }}>
          <span>
            이 페이지는 {config.schoolName} 동아리 학습 안내용이며, 지능형 과학실 ON(한국과학창의재단)의 공식 페이지가 아닙니다. 실제 입력과 제출은 지능형 과학실 ON에서 합니다.
          </span>
          <OnLink />
        </div>
      </footer>
    </>
  );
}
