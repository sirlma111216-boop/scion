# 이미지 슬롯

앱은 아래 경로의 파일을 그대로 보여 줍니다. **같은 이름으로 파일을 넣고 다시 배포하면 보입니다.** 파일이 없으면 점선 빈 상자에 캡션과 「그림 준비 중」이 표시됩니다.

| 슬롯 | 쓰이는 곳 | 비율 | 캡션(alt) |
|---|---|---|---|
| `gen/hero.png` | 홈 상단 | 16:9 | 학교 옥상의 태양광 패널과 측정하는 학생들 |
| `gen/analogy-seats.png` | 활동 1-과정 1 먼저 읽기 | 4:3 | 빈자리가 반대쪽으로 움직이는 것처럼 보여요(양공) |
| `gen/analogy-slide.png` | 활동 1-과정 1 2번 해설 | 4:3 | pn 접합의 전기장은 전자와 양공을 갈라 보내는 미끄럼틀 |
| `gen/solar-cell-layers.png` | 활동 1-과정 2 3번 해설 | 4:3 | 태양 전지는 여러 층을 쌓은 샌드위치 |
| `gen/light-angle.png` | 활동 4-과정 1 4번 해설 | 16:9 | 똑바로 비추면 좁고 밝게, 비스듬히 비추면 넓고 흐리게 |
| `gen/shadow-pin.png` | 활동 2-과정 1 4번, 측정 도우미 실험 2 | 4:3 | 수직 막대의 그림자로 각도 재기 |
| `gen/shade-layers.png` | 측정 도우미 실험 1 | 4:3 | 가림막 겹 수로 일사량 바꾸기 |
| `gen/cooling-panel.png` | 측정 도우미 실험 3 | 4:3 | 얼음팩으로 태양 전지 식히기 |
| `gen/team-roles.png` | 활동 2-과정 2, 측정 도우미 준비 | 16:9 | 설치 · 측정 · 입력 · 관리 네 가지 역할 |
| `photo/setup-overview.jpg` | 측정 도우미 연결과 설치 | 4:3 | 우리 장비를 모두 설치한 모습(예시 이미지) |
| `photo/energy-wiring.jpg` | 자료실, 연결과 설치 | 4:3 | 에너지 센서 연결과 Load 스위치(예시 이미지) |
| `photo/pyranometer-mount.jpg` | 자료실 | 4:3 | 일사량 센서를 판에 고정한 모습(예시 이미지) |
| `photo/temp-sensor-back.jpg` | 자료실 | 4:3 | 표면 온도 센서를 뒷면에 붙인 모습(예시 이미지) |
| `photo/shadow-pin-real.jpg` | 활동 2-과정 1 4번, 실험 2 | 4:3 | 수직 막대와 그림자(예시 이미지) |

- `gen/`, `photo/` 의 14장은 제공받은 이미지 세트(imagegen 생성, 등장 학생은 모두 여학생, 센서는 버니어 제품 사진을 참조해 재현)입니다. 실제 제품 원본 사진이나 실제 촬영 사진이 아닙니다.
- 용량을 줄이려면 `node scripts/shrink-images.mjs` (가로 1400px, PNG 팔레트 양자화).
- `upload/` 의 3장(n-type.png, p-type.png, solar-cell.png)은 학생이 ON에 올릴 그림이며 출처는 `upload/credits.json` 에 있습니다(위키미디어 공용, CC BY).
