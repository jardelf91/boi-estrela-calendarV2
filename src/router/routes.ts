import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/CalendarioPage.vue') },
      { path: 'proximas', component: () => import('pages/ProximasPage.vue') },
      { path: 'historico', component: () => import('pages/HistoricoPage.vue') },
      { path: 'sobre', component: () => import('pages/SobrePage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
