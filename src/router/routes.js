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
    ],
  },

  // LAYOUT AUTH
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      // Handler untuk semua callback Supabase (link undangan, reset, magic link, dsb)
      { path: 'callback', component: () => import('pages/auth/AuthCallback.vue') },
      { path: 'set-password', component: () => import('pages/auth/SetPasswordPage.vue') },
      { path: 'reset-password', component: () => import('pages/auth/ResetPasswordPage.vue') },
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
