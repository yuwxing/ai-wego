import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8888',
          changeOrigin: true,
        },
      },
    },
    build: {
      // 构建输出目录
      outDir: 'dist',
      // 开启 gzip 压缩
      gzipSize: true,
      // 生成 sourcemap
      sourcemap: mode !== 'production',
    },

  }
})
