import Vue from 'vue'
import Router from 'vue-router'
import { basePath } from '@/settings'

// NOTE: 修复: Uncaught (in promise) Error: Redirected when going from "/login" to "/" via a navigation guard.
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch((err) => err)
}
// -------------

Vue.use(Router)

// import Layout from '@/layout'
/* Router Modules */
// import tableRouter from './modules/table'

/**
 * 参考：https://panjiachen.gitee.io/vue-element-admin-site/zh/guide/essentials/router-and-nav.html
 * 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * redirect: 'noRedirect'
 *
 * 当设置 true 的时候该路由不会在侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * hidden: true  // (默认 false)
 */

/**
 *  当设置 true 的时候不是嵌套路由
 *  nested: true  // (默认 false)
 *
 * 设置动态路径参数，参考：https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html
 * pathToRegexp：'/redirect/:path(.*)' // (默认不设置)
 */

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
  })

function generateConstRoutes(modules) {
  let routes = []
  const routerKeys = Object.keys(modules)
  const routerContent = Object.values(modules)

  // Object.entires() 报错

  routerKeys.forEach((culValue, index) => {
    let item = modules[culValue]
    let route = {}
    if (!item.hidden) {
      return
    }

    let path = culValue.replace('/', '')
    route.path = `/${path}`
    if (item.nested) {
      route.component = routerContent[index]
      if (item.pathToRegexp) {
        route.path = item.pathToRegexp
      }
    } else {
      route.component = () => import('@/layout/index.vue')
      route.children = []
      let subRoute = {
        path: '',
        component: routerContent[index]
      }
      if (item.pathToRegexp) {
        subRoute.path = item.pathToRegexp
      }
      route.children.push(subRoute)
    }
    if (item.name) {
      route.name = item.name
    }
    routes.push(route)
  })

  return routes
}

const staticRoutes = generateConstRoutes(modules)

// 默认路由
export const constantRoutes = [
  {
    path: '/personal',
    component: () => import('@/layout/index.vue'),
    redirect: 'noRedirect',
    meta: {
      title: 'personal',
      icon: 'el-icon-location-outline'
    },
    children: [
      {
        path: 'personalInfo',
        name: 'personalInfo',

        component: () => import('@/views/personal/personalInfo.vue'),
        meta: {
          title: 'personalInfo',
          hidden: !1 //  是否需要隐藏侧边栏
        }
      }
    ]
  },
  {
    path: '/download',
    component: () => import('@/layout/index.vue'),
    redirect: 'noRedirect',
    meta: {
      title: 'download',
      icon: 'el-icon-location-outline'
    },
    children: [
      {
        path: 'downloadCenter',
        name: 'downloadCenter',

        component: () =>
          import('@/views/backManager/downloadCenter/DownloadCenter.vue'),
        meta: {
          title: 'downloadCenter',
          hidden: !1 //  是否需要隐藏侧边栏
        }
      }
    ]
  },
  // 快速登录退出
  {
    path: '/quickLogin',
    name: 'quickLogin',
    component: () => import('@/views/login/quickLogin.vue'),
    meta: { title: 'quickLogin' },
    hidden: true
  },
  // {
  //   path: '/redirect',
  //   component: () => import('@/layout'),
  //   hidden: true,
  //   children: [
  //     {
  //       path: '/redirect/:path(.*)',
  //       component: () => import('@/views/redirect/index')
  //     }
  //   ]
  // },
  // {
  //   path: '/login',
  //   component: () => import('@/views/login/index'),
  //   hidden: true
  // },
  // {
  //   path: '/404',
  //   component: () => import('@/views/404/index'),
  //   hidden: true
  // }
  ...staticRoutes
]

function generateAsyncRoutes(modules) {
  let routes = []
  // console.log(Object.keys(modules))
  const routerKeys = Object.keys(modules)
  const routerContent = Object.values(modules)

  routerKeys.forEach((culValue, index) => {
    let item = modules[culValue]
    let route = {}
    if (item.hidden) {
      return
    }

    if (!item.redirect) {
      route.redirect = 'noRedirect'
    }
    // console.log(culValue)
    // let path = culValue.replace(/^(.*)\/index$/, '$1')
    let path = culValue.replace('/', '')

    route.path = `/${path}`
    // console.log(path)
    if (!item.nested) {
      route.component = () => import('@/layout/index.vue')
      route.children = []
      let subRoute = {
        path: '',
        name: item.name ? item.name : path.replace(/\//g, '-'),
        component: routerContent[index]
      }
      if (item.meta) {
        subRoute.meta = item.meta
      }
      if (item.pathToRegexp) {
        subRoute.path = item.pathToRegexp
      }
      route.children.push(subRoute)
    }

    routes.push(route)
  })

  return routes
}

const dynamicRoutes = generateAsyncRoutes(modules)

export const asyncRoutes = [...dynamicRoutes]

// 404 page must be placed at the end !
export const errorRoutes = [{ path: '*', redirect: '/404', hidden: true }]

const createRouter = () =>
  new Router({
    base: `${basePath}/`,
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
// reset router
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
