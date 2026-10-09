import { Figure } from '../../components/Figure';
import { EasyCard, ExampleBox, ExampleNotice, WarnBox } from '../../components/Helpers';
import { ImageDownload } from '../../components/ImageDownload';
import { OnDropdown, OnFrame, OnInput, OnQ, OnSaveButton, OnUploadButton } from '../../components/On';
import { QrCode } from '../../components/QrCode';
import { Rich } from '../../components/Rich';
import { YouTube } from '../../components/YouTube';
import { act1p1, act1p2 } from '../../content/act1';
import { config } from '../../content/config';
import { ProcessNav } from './ProcessNav';

export function Act1P1() {
  const c = act1p1;
  return (
    <OnFrame path="/my/1/1" section="탐구계획" activity="활동1. 문제인식">
      <ProcessNav items={[{ to: '/my/1/1', label: '과정 1' }, { to: '/my/1/2', label: '과정 2' }]} />
      <OnDropdown>{c.dropdown}</OnDropdown>

      <EasyCard title={c.preRead.title}>
        <ol>
          {c.preRead.items.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </ol>
        <Figure slot="gen/analogy-seats.png" caption="빈자리가 반대쪽으로 움직이는 것처럼 보여요(양공)" />
      </EasyCard>
      <WarnBox>
        <Rich text={c.preRead.warn} />
      </WarnBox>

      <OnQ n={1}>{c.q1.title}</OnQ>
      <ExampleNotice />
      <table className="on-table">
        <thead>
          <tr>
            <th>{c.q1.headN}</th>
            <th>{c.q1.headP}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ExampleBox id="1-1-1a" text={c.q1.exampleN} tall />
            </td>
            <td>
              <ExampleBox id="1-1-1b" text={c.q1.exampleP} tall />
            </td>
          </tr>
          <tr>
            <th>{c.q1.imgN}</th>
            <th>{c.q1.imgP}</th>
          </tr>
          <tr>
            <td>
              <OnUploadButton />
              <ImageDownload file="n-type.png" compact />
            </td>
            <td>
              <OnUploadButton />
              <ImageDownload file="p-type.png" compact />
            </td>
          </tr>
          <tr>
            <td>
              출처: <OnInput placeholder="(위의 출처 문자열을 붙여 넣어요)" />
            </td>
            <td>
              출처: <OnInput placeholder="(위의 출처 문자열을 붙여 넣어요)" />
            </td>
          </tr>
        </tbody>
      </table>
      <EasyCard>
        <Rich text={c.q1.easyFigure} />
      </EasyCard>

      <OnQ n={2}>{c.q2.title}</OnQ>
      <table className="on-table">
        <thead>
          <tr>
            <th>{c.q2.head}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <YouTube id={config.videos.pnJunction} title={c.q2.head} />
            </td>
          </tr>
        </tbody>
      </table>
      <EasyCard title={c.q2.easyTitle}>
        <ol>
          {c.q2.easy.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </ol>
        <p>
          <Rich text={c.q2.easyTail} />
        </p>
        <Figure slot="gen/analogy-slide.png" caption="pn 접합의 전기장은 전자와 양공을 갈라 보내는 미끄럼틀" />
      </EasyCard>
      <table className="on-table">
        <thead>
          <tr>
            <th>{c.q2.ask}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ExampleBox id="1-1-2" text={c.q2.example} tall />
            </td>
          </tr>
        </tbody>
      </table>
      <OnSaveButton />
    </OnFrame>
  );
}

export function Act1P2() {
  const c = act1p2;
  return (
    <OnFrame path="/my/1/2" section="탐구계획" activity="활동1. 문제인식">
      <ProcessNav items={[{ to: '/my/1/1', label: '과정 1' }, { to: '/my/1/2', label: '과정 2' }]} />
      <OnDropdown>{c.dropdown}</OnDropdown>

      <OnQ n={1}>{c.q1.title}</OnQ>
      <EasyCard>
        <ul>
          {c.q1.easy.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </ul>
      </EasyCard>
      <ExampleNotice />
      <table className="on-table">
        <thead>
          <tr>
            <th>{c.q1.head}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ExampleBox id="1-2-1" text={c.q1.example} tall />
            </td>
          </tr>
        </tbody>
      </table>

      <OnQ n={2}>{c.q2.title}</OnQ>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <QrCode text={c.q2.url} size={160} caption={c.q2.caption} />
        <div>
          <p className="small">
            [링크:{' '}
            <a href={c.q2.url} target="_blank" rel="noreferrer">
              {c.q2.url}
            </a>
            ]
          </p>
          <EasyCard title={c.q2.easyTitle}>
            <p className="small muted">{c.q2.easyNote}</p>
            <ol>
              {c.q2.easy.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ol>
            <p>{c.q2.easyCheck}</p>
          </EasyCard>
        </div>
      </div>

      <OnQ n={3}>{c.q3.title}</OnQ>
      <table className="on-table">
        <thead>
          <tr>
            <th>{c.q3.head}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <OnUploadButton />
              <ImageDownload file="solar-cell.png" />
              <div style={{ marginTop: 8 }}>
                출처: <OnInput placeholder="(위의 출처 문자열을 붙여 넣어요)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <EasyCard title={c.q3.easyTitle}>
        <ol>
          {c.q3.easy.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </ol>
        <Figure slot="gen/solar-cell-layers.png" caption="태양 전지는 여러 층을 쌓은 샌드위치" />
      </EasyCard>

      <OnQ n={4}>{c.q4.title}</OnQ>
      <table className="on-table">
        <thead>
          <tr>
            <th colSpan={2}>{c.q4.head}</th>
          </tr>
        </thead>
        <tbody>
          {c.q4.steps.map((s) => (
            <tr key={s.n}>
              <th style={{ width: 80 }}>{s.n}</th>
              <td className={s.fixed ? 'fixed' : ''}>{s.fixed ? s.fixed : <ExampleBox id="1-2-4" text={s.example!} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small">
        {c.q4.ref.split(' ')[0]}{' '}
        <a href={`https://youtu.be/${config.videos.pvProcess}`} target="_blank" rel="noreferrer">
          https://youtu.be/{config.videos.pvProcess}
        </a>
      </p>
      <YouTube id={config.videos.pvProcess} title="태양광 발전 과정 참고 영상" />
      <EasyCard>
        <Rich text={c.q4.easy} />
      </EasyCard>
      <OnSaveButton />
    </OnFrame>
  );
}
