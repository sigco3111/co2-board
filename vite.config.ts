import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      publicDir: 'public', // public 디렉토리의 파일들이 빌드 시 복사되도록 명시적으로 설정
      build: {
        assetsDir: 'assets', // 에셋 디렉토리 명시
        outDir: 'dist', // 출력 디렉토리 명시
        emptyOutDir: true, // 빌드 전 출력 디렉토리를 비움
      }
    };
});
