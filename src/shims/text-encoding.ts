// @vernier/godirect 가 TextDecoder 가 없는 환경에서만 require 하는 폴리필. 브라우저에는 내장돼 있어 빈 모듈로 대체한다.
export const TextDecoder = globalThis.TextDecoder;
export const TextEncoder = globalThis.TextEncoder;
export default { TextDecoder, TextEncoder };
