import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      // 不显示每个文件的压缩日志
      verbose: false,
      // 启用插件
      disable: false,
      // 只压缩大于 10KB 的文件（单位：字节）
      threshold: 10240,
      // 使用 gzip 算法
      algorithm: 'gzip',
      // 生成 .gz 文件
      ext: '.gz',
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8083', changeOrigin: true },
      '/files': { target: 'http://localhost:8083', changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      checks: {
        pluginTimings: false
      },
      onwarn(warning, warn) {
        if (warning.message.includes('INVALID_ANNOTATION')) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'element-plus'
            }
            if (id.includes('axios') || id.includes('marked')) {
              return 'utils'
            }
            if (id.includes('echarts')) {
              return 'charts'
            }
            if (id.includes('@vueuse')) {
              return 'vueuse'
            }
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'axios',
      'echarts'
    ]
  }
})