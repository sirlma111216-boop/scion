import { config } from '../content/config';

/** youtube-nocookie 임베드 + 「유튜브에서 보기」 링크(임베드가 막힌 영상 대비) */
export function YouTube({ id, title }: { id: string; title: string }) {
  if (!id) {
    return (
      <div className="on-box">
        영상 주소가 아직 없어요. 지능형 과학실 ON에서 영상을 보세요.{' '}
        <a href={config.scienceOnUrl} target="_blank" rel="noreferrer">
          ON 바로가기
        </a>
      </div>
    );
  }
  return (
    <div>
      <div className="yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <p className="small">
        <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">
          ▶ 유튜브에서 보기
        </a>{' '}
        <span className="muted">(화면이 비어 있으면 이 링크로 보세요. 영상은 인터넷이 필요해요.)</span>
      </p>
    </div>
  );
}
