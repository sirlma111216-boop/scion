# 태양광 체인지메이커 탐구 도우미 (scion)

지능형 과학실 ON 공동탐구 「우리는 체인지메이커! 학교(지역)의 태양광 발전량을 늘리자!」(심화 탐구: 조건(일사량, 각도, 온도)에 따른 태양 전지의 발전량 측정)를 중학교 동아리 팀이 혼자 따라 할 수 있게 돕는 **완전 정적 웹앱**입니다. 서버·DB·생성형 AI 를 쓰지 않습니다.

- **주제 알아보기** — ON의 주제 소개·이해하기 화면을 같은 순서로, 쉬운 해설과 함께
- **나의 공동탐구** — ON의 활동 1~5 화면(문항 번호·문구·표 모양)을 그대로 재현하고 문항마다 쉬운 해설·용어 풀이·모범 예시를 붙임
- **측정 도우미** — 버니어 Go Direct 센서 3종(에너지·일사량·표면 온도)을 웹 블루투스로 연결, 7단계 마법사로 일사량·각도·온도 실험을 안내하고 1~3회 측정값·평균·특이사항을 자동 기록. 직접 입력 모드·연습 모드(가상 센서) 포함
- **결과 정리** — ON 입력 표와 똑같은 모양으로 값 제시(한 줄씩 따라 입력), 그래프, 내 데이터로 채운 문장, 공유 링크·QR, JSON/CSV/인쇄
- **자료실** — ON에 올릴 그림 3장과 출처, 센서 사용법, 용어 사전, 영상
- **선생님** — 측정 전 점검표, 기기 설정(팀원 이름은 기기에만 저장), 자료 넣기 안내
- `/diagnostics` — 센서 진단(모든 채널 표, 보고 복사)

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest 단위 테스트
npm run build      # dist/ (PWA 프리캐시 포함)
npm run preview    # 빌드 결과 미리보기
```

센서 연결(Web Bluetooth)은 **크롬(윈도우·크롬북·안드로이드)** 에서만 됩니다. 아이패드·아이폰은 안 됩니다. 배포 주소는 https 여야 합니다(localhost 는 예외).

## Cloudflare 배포 (깃허브 연동)

저장소: `https://github.com/sirlma111216-boop/scion.git`

**(가) Workers Builds — 권장**
1. Cloudflare 대시보드 → Workers & Pages → Create → Workers → 「Import a repository」로 이 저장소 연결
2. Build command: `npm run build` / Deploy command: `npx wrangler deploy`
3. `wrangler.jsonc` 가 `dist/` 를 정적 자산으로 배포합니다. 라우팅은 HashRouter 라 `_redirects` 가 필요 없습니다.

**(나) Pages**
1. Workers & Pages → Create → Pages → Connect to Git
2. Framework preset: **Vite** / Build command: `npm run build` / Build output directory: `dist`

## 자료 넣기

- 이미지 슬롯: `public/images/README.md` 의 표와 같은 이름으로 파일을 넣고 다시 배포하면 보입니다.
- ON 업로드용 그림 3장: `public/images/upload/` + 출처 `credits.json` (`src/content/credits.json` 과 같은 내용 — 둘 다 고치세요)
- 문구(해설·예시·화면 글): `src/content/*.ts`. 과학 내용은 지시서 5장을 그대로 옮긴 것입니다.
- 학교별 설정(이름, 위치, 영상 주소, 막대 높이, 표본 간격): `src/content/config.ts`. 심화탐구 소개 영상 주소 `videos.deepIntro` 는 비어 있습니다.
- 공공 데이터: `public/data/solar-facilities.csv` 를 넣으면 활동 4-과정 2에 검색 표로 보여 주도록 확장할 수 있습니다(현재는 안내만).

## 저장 구조(localStorage)

| 키 | 내용 |
|---|---|
| `scion:v1` | 실제 측정 세션(스키마 version 1) |
| `scion:demo` | 연습 모드 세션 — 실제 키와 완전히 분리 |
| `scion:mode` | `real` / `demo` |
| `scion:settings` | 팀원 이름·역할·장소·위치·막대 높이·표본 설정(기기에만) |
| `scion:progress` | 「다 썼어요」 체크 |
| `scion:teacher`, `scion:survey` | 선생님 점검표·제출 점검표, 조사 기록장 |

## 센서(실제 기기로 검증하지 못한 부분)

`@vernier/godirect` 1.8.3 을 사용합니다. 역할은 `orderCode`(GDX-NRG / GDX-PYR / GDX-ST)로 자동 판별하고, 채널은 단위(V·mA / W/m² / °C)로 고릅니다. 판별에 실패하면 `/diagnostics` 에서 채널을 직접 고를 수 있습니다. **실제 센서로 테스트하지 않고 만든 앱**이므로 첫 사용 전 선생님이 `/diagnostics` 에서 orderCode·채널 이름·단위를 확인해 주세요. 유선 BTA 계열(VES-BTA 등)은 블루투스가 되지 않으므로 「직접 입력 모드」를 쓰세요.

## 디자인

앱 바탕은 `DESIGN-coinbase.md`(흰 캔버스, 단일 파랑 `#0052ff`, 알약 버튼, 24px 카드, 가는 제목)를, ON 화면을 흉내 내는 요소는 ON 캡처 근삿값(보라 탐구명 태그, 남색 사이드바 선택, 하늘색 표 머리 등)을, 도우미 상자는 따뜻한 파스텔(노랑 해설·초록 예시·빨강 주의·파랑 데이터)을 씁니다. 글꼴은 Noto Sans KR 자체 포함.
