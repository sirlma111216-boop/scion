import { NavLink } from 'react-router-dom';

/** 활동 안의 과정 이동(ON 드롭다운 대신 누를 수 있게) */
export function ProcessNav({ items }: { items: { to: string; label: string }[] }) {
  if (items.length < 2) return null;
  return (
    <div className="row no-print" style={{ marginBottom: 8 }}>
      <span className="tiny muted">과정 바로가기:</span>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => `btn sm ${isActive ? 'primary' : ''}`}>
          {it.label}
        </NavLink>
      ))}
    </div>
  );
}
