// 도우미 상자들(2-2): 쉬운 해설(노랑), 모범 예시(초록), 주의(빨강), 내 데이터로 채운 문장(파랑)
import { useState, type ReactNode } from 'react';
import { useSession } from '../state/SessionContext';
import { CopyButton } from './CopyButton';
import { Rich } from './Rich';

export function EasyCard({ title = '쉽게 풀어 보기', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="helper easy">
      <div className="h">
        <span>💡</span> {title}
      </div>
      {children}
    </div>
  );
}

export function WarnBox({ title = '주의', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="helper warn">
      <div className="h">
        <span>⚠️</span> {title}
      </div>
      {children}
    </div>
  );
}

export function DataBox({ title = '내 데이터로 채운 문장', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="helper data">
      <div className="h">
        <span>📊</span> {title}
      </div>
      {children}
    </div>
  );
}

/** 예시는 참고용이라는 안내(화면에 한 번만) */
export function ExampleNotice() {
  return (
    <p className="small" style={{ color: '#1d7a3a', margin: '4px 0 8px' }}>
      🌱 예시는 참고용이에요. 그대로 베끼지 말고 자기 말로 고쳐 써 보세요.
    </p>
  );
}

/**
 * 모범 예시 상자. ON 입력 칸과 같은 자리에 놓인다. 처음에는 접혀 있다.
 * id 가 있으면 「다 썼어요」 체크가 진행 표시(localStorage)에 저장된다.
 */
export function ExampleBox({ id, text, label = '모범 예시 보기', tall, note }: { id?: string; text: string; label?: string; tall?: boolean; note?: string }) {
  const [open, setOpen] = useState(false);
  const { progress, setDone } = useSession();
  const done = id ? !!progress[id] : false;
  return (
    <div className={`on-input ${tall ? 'tall' : ''}`} style={{ padding: 6, color: 'inherit' }}>
      {!open ? (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="example-toggle" style={{ width: 'auto', flex: 1 }} onClick={() => setOpen(true)}>
            ▸ {label}
          </button>
          {id && done && <span className="badge green">다 썼어요 ✓</span>}
        </div>
      ) : (
        <div className="helper example" style={{ margin: 0 }}>
          <div className="h">
            <span>🌱</span> 모범 예시
            <button type="button" className="btn text sm" style={{ marginLeft: 'auto' }} onClick={() => setOpen(false)}>
              접기
            </button>
          </div>
          <div className="example-body">
            <Rich text={text} />
          </div>
          {note && <p className="small muted">{note}</p>}
          <div className="example-foot">
            <CopyButton text={text} />
            {id && (
              <label className="check">
                <input type="checkbox" checked={done} onChange={(e) => setDone(id, e.target.checked)} /> 다 썼어요
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
