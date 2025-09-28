
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router';

// 创建 Vue 路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./components/Search.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const app = createApp(App);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
