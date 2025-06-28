import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Practice',
    component: () => import('../pages/Practice.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 