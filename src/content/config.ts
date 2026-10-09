// 학교별 설정은 이 파일 한 곳에 모은다. 값만 고치면 된다.
export const config = {
  appTitle: '태양광 체인지메이커 탐구 도우미',
  schoolName: '경희여자중학교',
  scienceOnUrl: 'https://science-on.kosac.re.kr',
  location: { name: '경희여자중학교', lat: 37.59, lon: 127.05 }, // 대략값, 설정 화면에서 수정 가능
  videos: {
    topicIntro: 'hGJ03Yui4iY', // 공동탐구 주제 소개
    deepIntro: '', // 심화탐구 소개 영상(주소 미확인, 비어 있으면 ON 사이트 링크로 대체)
    pnJunction: 'ZTzLpCovXu0', // 「p형 반도체와 n형 반도체를 접합한 모습」(한국과학창의재단)
    pvProcess: 'Os1sHAt1nV8', // 활동 1-과정 2-4번 [참고] 영상
  },
  team: ['학생 A', '학생 B', '학생 C', '학생 D'],
  pinHeightCm: 5.0, // 각도 측정용 수직 막대 높이
  sampling: { periodMs: 500, windowSec: 5 },
};

export type Config = typeof config;
