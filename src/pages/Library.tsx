import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Figure } from '../components/Figure';
import { WarnBox } from '../components/Helpers';
import { ImageDownload } from '../components/ImageDownload';
import { Rich } from '../components/Rich';
import { YouTube } from '../components/YouTube';
import { config } from '../content/config';
import { sensorGuide } from '../content/sensorsGuide';
import { terms } from '../content/terms';

function SensorSection({ id, g, photo, caption }: { id: string; g: { title: string; steps: string[]; photoNote: string; warn: string }; photo: string; caption: string }) {
  return (
    <section className="card" id={id}>
      <h3>{g.title}</h3>
      <div className="grid-2">
        <div>
          <ol>
            {g.steps.map((s) => (
              <li key={s}>
                <Rich text={s} />
              </li>
            ))}
          </ol>
          <div className="helper data">
            <div className="h">
              <span>📷</span> 사진 보는 법
            </div>
            <Rich text={g.photoNote} />
          </div>
          <WarnBox>{g.warn}</WarnBox>
        </div>
        <Figure slot={photo} caption={caption} />
      </div>
    </section>
  );
}

export function Library() {
  const loc = useLocation();
  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1));
      if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [loc.hash]);
  return (
    <div className="stack">
      <div>
        <h1>자료실</h1>
        <div className="row">
          <a className="btn sm" href="#/library#images">
            그림 자료 받기
          </a>
          <a className="btn sm" href="#/library#sensors">
            센서 사용법
          </a>
          <a className="btn sm" href="#/library#terms">
            용어 사전
          </a>
          <a className="btn sm" href="#/library#videos">
            영상 모음
          </a>
        </div>
      </div>

      <section className="card" id="images">
        <h2>그림 자료 받기</h2>
        <p className="muted">ON에 올릴 그림 3장이에요. 내려받아 「이미지 업로드」에 올리고, 출처를 「출처:」 칸에 붙여 넣어요.</p>
        <div className="grid-3">
          <ImageDownload file="n-type.png" />
          <ImageDownload file="p-type.png" />
          <ImageDownload file="solar-cell.png" />
        </div>
      </section>

      <section id="sensors">
        <h2>센서 사용법</h2>
        <div className="card soft" style={{ marginBottom: 16 }}>
          <Rich text={sensorGuide.common} />
        </div>
        <div className="stack">
          <SensorSection id="sensor-energy" g={sensorGuide.energy} photo="photo/energy-wiring.jpg" caption="에너지 센서 연결과 Load 스위치(예시 이미지)" />
          <SensorSection id="sensor-pyr" g={sensorGuide.pyr} photo="photo/pyranometer-mount.jpg" caption="일사량 센서를 판에 고정한 모습(예시 이미지)" />
          <SensorSection id="sensor-st" g={sensorGuide.st} photo="photo/temp-sensor-back.jpg" caption="표면 온도 센서를 뒷면에 붙인 모습(예시 이미지)" />
        </div>
      </section>

      <section className="card" id="terms">
        <h2>용어 사전</h2>
        <table className="plain-table">
          <thead>
            <tr>
              <th style={{ width: 180 }}>용어</th>
              <th>풀이</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.term}>
                <td>
                  <b>{t.term}</b>
                </td>
                <td>{t.def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" id="videos">
        <h2>영상 모음</h2>
        <div className="grid-2">
          <div>
            <h4>공동탐구 주제 소개</h4>
            <YouTube id={config.videos.topicIntro} title="공동탐구 주제 소개" />
          </div>
          <div>
            <h4>p형 반도체와 n형 반도체를 접합한 모습</h4>
            <YouTube id={config.videos.pnJunction} title="pn 접합" />
          </div>
          <div>
            <h4>태양광 발전 과정 [참고]</h4>
            <YouTube id={config.videos.pvProcess} title="태양광 발전 과정" />
          </div>
          <div>
            <h4>심화탐구 소개</h4>
            <YouTube id={config.videos.deepIntro} title="심화탐구 소개" />
          </div>
        </div>
      </section>
    </div>
  );
}
