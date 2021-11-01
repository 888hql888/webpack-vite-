## 一、vite相关介绍

[下一代前端构建工具 - Vite 2.x 源码级分析-技术圈 (proginn.com)](https://jishuin.proginn.com/p/763bfbd5e921)

##  二、vite迁移细节·	

*** ps：vite 仅支持 node 12版本以上，建议安装node 12以上 稳定版本 ***

* node -v 查看node版本 

1. 配置 pack.age.json命令

   1.1

```javascript
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview"

}
```

​	1.2 复制 public下的index.html文件 并 添加 vite的script导入  将文件 移动到 根目录下

```javascript
<script type="module" src="/src/main.js ps:放 <div id='app'> 后面  </script>
```

2. 安装包 

```javascript
npm i vite vite-plugin-html vite-plugin-vue2 (适合vue2.x版本) -D
```

3.注释 postcss.confis.js 里面的plugin配置

4.补全 mai.js 入口文件的 简写文件 如 省略 index.vue的index文件 （vite.config.js可配置 .vue 文件 ps:官方不推荐(but..还是配了)）

> 5.去掉 element 引入部分样式的波浪线
>
> ```javascript
> $--font-path: '~element-ui/lib/theme-chalk/fonts';
> @import "~element-ui/packages/theme-chalk/src/index";
> ```
>
> ========>
>
> ```javascript
> $--font-path: 'element-ui/lib/theme-chalk/fonts';
> @import "element-ui/packages/theme-chalk/src/index";
> ```

6. 配置jsx     

   6.1 配置vite.config.js

```javascript
`plugins: [  createVuePlugin({   jsx: true,   jsxOptions: {    injectH: false   } })`
```

​		6.2 修改含有jsx语法的scrtpt标签

```javascript
<script lang="jsx"></script>
```

7. 修改webpack的导入方式 为 vite 的 Global 导入

```javascript
// const modulesFiles = require.context('@/views', true, /\.vue$/)
```

​	=====>

```javascript
const modulesFiles = import.meta.globEager(`/src/views/**/*.vue`)
```



8. 修改vue-cli环境变量 (参考vite文档) 安装 dotenv 插件

// 是否是生产环境

```javascript
const isProduction = process.env.NODE_ENV === 'production'
```

====>

```javascript
const isProd = import.meta.env.PROD
```

9. 修改 路由 vuex i18n.js  (router/sote等index.js) 等读取配置文件

​	9.1 router/index.js 文件的读取代码

```javascript
// const modulesFiles = require.context('@/views', true, /\.vue$/)
const modulesFiles = import.meta.globEager(`/src/views/**/*.vue`)

// 创建新的路由
const ignorePath = '_components'

const modules = {}
Object.entries(modulesFiles)
  .filter(([path]) => path.indexOf(ignorePath) === -1)
  .forEach(([path, fileCtx]) => {
    const pathName = path
      .replace('/src/views', '')
      .replace('/index.vue', '')
      .replace('.vue', '')
    modules[pathName] = fileCtx.default
  }) ...部分省略 见源码
```

​	9.2 store/index.js 文件读取

```javascript
// vite
const modules = {}

const modulesFiles = import.meta.globEager(`./modules/**/*.js`)

Object.entries(modulesFiles).forEach(([filename, fileCtx]) => {
  const name = filename.replace('./modules/', '').replace('.js', '')
  if (fileCtx === undefined) return
  modules[name] = fileCtx.default
})
...部分省略 见源码
```

​	9.3 i18n.js

```javascript
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages() {
  const locales = import.meta.globEager('./lang/*.json')
  const messages = {}
  Object.entries(locales).forEach(([fileName, fileCtx]) => {
    fileName = fileName.replace('./lang/', './')
    const matched = fileName.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const key = fileName.replace('./', '').replace('.json', '')
      messages[key] = fileCtx.default
    }
  })
  return messages
}

export default new VueI18n({
  locale: import.meta.env.VUE_APP_I18N_LOCALE || 'zh',
  fallbackLocale: import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE || 'zh',
  messages: loadLocaleMessages()
})
```

10 vite.confi.js (基础版)

```javascript
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

```

 11.如有部分配置缺失或者不一致 详情参考底部4篇文章.

1.配置文件的不同，具体在vite.config.js上，具体配置见官网[配置 Vite | Vite中文网 (vitejs.cn)](https://vitejs.cn/config/)

​	必备的插件：vite-plugin-vue2、@vitejs/plugin-legacy、vite-plugin-html

2.导入导出模式不同，只支持esm模式（静态资源的引入）

 webpack写法：

```javascript
// webpack写法
<img src="../../../assets/img/404.png" />
    
require(../../../assets/img/404.png)
```

vite写法：

```javascript
// vite写法
import tipImg from '@/assets/img/prompt.png'
export default {
  data() {
    return {
      tipImg,
    }
  },
```

3.获取环境变量的不同

webpack写法：

```javascript
// 是否是生产环境
const isProduction = process.env.NODE_ENV === 'production'
```

vite写法：

```js
const isProd = import.meta.env.PROD
```

4.通过目录生成路由

webpack写法：

```js
const modulesFiles = require.context('@/views', true, /\.vue$/)
const ignorePath = '_components'
const modules = modulesFiles
  .keys()
  .filter(path => path.indexOf(ignorePath) === -1)
  .reduce((modules, modulePath) => {
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const value = modulesFiles(modulePath)
    modules[moduleName] = value.default
    return modules
  }, {})
```

vite写法：

```js
// const modulesFiles = require.context('@/views', true, /\.vue$/)
const modulesFiles = import.meta.globEager(`/src/views/**/*.vue`)

// 创建新的路由
// function buildAppRouter() {}
const ignorePath = '_components'
const modules = {}
Object.entries(modulesFiles)
  .filter(([path]) => path.indexOf(ignorePath) === -1)
  .forEach(([path, fileCtx]) => {
    const pathName = path
      .replace('/src/views', '')
      .replace('/index.vue', '')
      .replace('.vue', '')
    modules[pathName] = fileCtx.default
  })
```

#### 相关链接：

1.[vue2项目迁移到 vite2（分享遇到的问题） - 掘金 (juejin.cn)](https://juejin.cn/post/6946131312008757256)

2.[备战2021：Vite2项目最佳实践 - 掘金 (juejin.cn)](https://juejin.cn/post/6924912613750996999#heading-23)

3.[6年的老项目迁移vite2，提速几十倍，真香](https://juejin.cn/post/7005479358085201957#heading-5)

4.[一个真实的Vue CLI项目迁移到vite](https://juejin.cn/post/7012494586664714248#heading-8)

