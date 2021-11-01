import { defineConfig } from 'vite'
import { injectHtml } from 'vite-plugin-html'
// import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import { createVuePlugin } from 'vite-plugin-vue2'

import path from 'path'
function resolve(dir) {
  return path.join(__dirname, dir)
}

import {title} from './src/settings.js'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: '/',
    clearScreen: false,
    plugins: [
      createVuePlugin({
        jsx: true
      }),
      injectHtml({ injectData: { title } })
      // dynamicImportVars()
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
        vendor: path.resolve(__dirname, './src/vendors')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json','.vue']
    },
    build: {
      outDir: 'res',
      minify: 'terser',
      assetsDir: './assets'
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$injectedColor: orange;`
        }
      }
    },
    server: {
      port: 12345, // 端口号
      host: '0.0.0.0',
      https: false, // https:{type:Boolean}
      open: true, //配置自动启动浏览器
      // 配置多个代理
      proxy: {
        '/api/res/': {
          // target: 'http://192.168.200.110:8201',
          target: 'http://192.168.200.221:5012',
          changeOrigin: true
          // pathRewrite: {}
        },
        '/api/res-127/': {
          // target: 'http://192.168.200.110:8201',
          target: 'http://192.168.200.221:5012',
          changeOrigin: true
          // pathRewrite: {}
        },
        '/api/res-55/': {
          // target: 'http://192.168.200.110:8201',
          target: 'http://192.168.200.221:5012',
          changeOrigin: true
          // pathRewrite: {}
        },
        '/api/system-mgt': {
          // target: 'http://192.168.200.110:8201',
          target: 'http://192.168.200.221:5012',
          changeOrigin: true,
          pathRewrite: {}
        },
        // '/api/file'
        '^/api/file': {
          // 匹配以/api/file开头的 原版是 /api/file
          target: 'http://192.168.171.184:5000',
          changeOrigin: true,
          pathRewrite: {
            '^/api/file': ''
          }
        },
        '/api/sso': {
          target: 'http://192.168.200.223:5012',
          changeOrigin: true,
          pathRewrite: {}
        },
        '/api/store-cloud': {
          target: 'http://192.168.200.218:5012',
          changeOrigin: true
          // '^/api/store-cloud': ''
        }
      }
    }
  }
})
