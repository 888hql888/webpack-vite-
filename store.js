/*
 * @Description:
 * @Date: 2021-10-28 10:47:26
 * @LastEditTime: 2021-11-01 10:07:13
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

// const debug = import.meta.env.DEV

// vite
const modules = {}

const modulesFiles = import.meta.globEager(`./modules/**/*.js`)

Object.entries(modulesFiles).forEach(([filename, fileCtx]) => {
  const name = filename.replace('./modules/', '').replace('.js', '')
  if (fileCtx === undefined) return
  modules[name] = fileCtx.default
})

// console.log(modules)

export default new Vuex.Store({
  modules,
  getters,
  state: {},
  mutations: {},
  actions: {},
  strict: false
})
