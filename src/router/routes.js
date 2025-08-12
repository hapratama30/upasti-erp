// src/router/routes.js
import { supabase } from 'src/lib/supabaseClient'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        beforeEnter: async (to, from, next) => {
          const { data } = await supabase.auth.getSession()
          if (data.session) next('/dashboard')
          else next()
        },
      },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterCompany.vue') },

      // Jalur pengaman: jika entah bagaimana router "membaca" /access_token=...
      {
        path: 'access_token=:rest(.*)*',
        redirect: (to) => {
          const raw = to.fullPath.split('access_token=')[1] || ''
          const sp = new URLSearchParams('access_token=' + raw)
          return {
            path: '/auth/set-password',
            query: {
              access_token: sp.get('access_token') || '',
              refresh_token: sp.get('refresh_token') || '',
            },
          }
        },
      },
    ],
  },

  // Layout khusus auth
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'set-password', component: () => import('pages/auth/SetPasswordPage.vue') },
      { path: 'reset-password', component: () => import('pages/auth/ResetPasswordPage.vue') },

      // Callback opsional kalau nanti kamu set di Supabase -> https://domain/auth/callback
      {
        path: 'callback',
        redirect: (to) => {
          const hash = (typeof window !== 'undefined' ? window.location.hash : '').replace(
            /^#\/?/,
            '',
          )
          const source = to.fullPath.includes('access_token') ? to.fullPath.split('?')[1] : hash
          const sp = new URLSearchParams(source || '')
          return {
            path: '/auth/set-password',
            query: {
              access_token: sp.get('access_token') || '',
              refresh_token: sp.get('refresh_token') || '',
            },
          }
        },
      },
    ],
  },

  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    beforeEnter: async (to, from, next) => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) next('/login')
      else next()
    },
    children: [{ path: '', component: () => import('pages/DashboardPage.vue') }],
  },

  {
    path: '/dashboard/employees',
    component: () => import('layouts/EmployeeLayout.vue'),
    children: [
      { path: '', component: () => import('pages/EmployeesPage.vue') },
      { path: 'categories', component: () => import('pages/CategoriesPage.vue') },
    ],
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
