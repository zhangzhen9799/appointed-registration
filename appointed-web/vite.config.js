import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import alias from '@rollup/plugin-alias';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  base: process.env.NODE_ENV === 'development' ? './' : './',
  define: {
    'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
    'process.env.CUSTOM_ENV': `'${process.env.CUSTOM_ENV}'`
  },
  plugins: [
    vue(),
    alias({
      entries: [
        {
          find: '@',
          replacement: '/src'
        }
      ]
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  server: {
    cors: true,
    proxy: {
      '/v1': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: true
      },
      '/114': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
