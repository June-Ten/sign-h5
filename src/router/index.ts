
import { createRouter, createWebHistory, RouterOptions, Router, RouteRecordRaw } from 'vue-router'

import App from '../App.vue'

const routes: RouteRecordRaw[] = [
  { 
    path: '/',
    name: 'Home',
    component: App
  }
]

// RouterOptions是路由选项类型
const options: RouterOptions = {
 history: createWebHistory(),
 routes,
}

// Router是路由对象类型
const router: Router = createRouter(options)

export default router