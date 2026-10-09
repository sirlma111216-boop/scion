/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/**/*', 'data/**/*'],
      manifest: {
        name: '태양광 체인지메이커 탐구 도우미',
        short_name: '태양광 도우미',
        description: '지능형 과학실 ON 공동탐구(태양광 발전량) 안내·측정·정리 도우미',
        lang: 'ko',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0052ff',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 글꼴(woff2, 수백 개의 유니코드 조각)은 프리캐시 대신 런타임 캐시 — 한 번 본 조각은 오프라인에서도 보인다
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,json,csv}'],
        runtimeCaching: [
          {
            urlPattern: /\.woff2?$/,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  base: './',
  resolve: {
    alias: {
      // godirect 가 TextDecoder 없는 환경에서만 require 하는 폴리필 — 브라우저에는 내장
      'text-encoding': fileURLToPath(new URL('./src/shims/text-encoding.ts', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
