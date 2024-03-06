import { createApp } from 'vue'
import './style.css'
import 'pdfh5/css/pdfh5.css'
import router from './router'
import App from './App.vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//需引入默认样式
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import VConsole from 'vconsole'
import 'vant/es/toast/style'

createApp(App).use(router).use(Vue3DraggableResizable).mount('#app')
if (import.meta.env.MODE === 'development') {
  const vConsole = new VConsole()
}
