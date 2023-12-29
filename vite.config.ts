import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { cjs2esmVitePlugin } from 'cjs2esmodule'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
    cjs2esmVitePlugin()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://8u059393j1.goho.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always"
      }
    }
  }
})