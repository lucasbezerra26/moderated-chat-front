import { createRouter, createWebHistory } from 'vue-router'
import AppLayoutDefault from '@/components/layout/AppLayoutDefault.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: {
        title: 'Moderated Chat - Sistema de Chat com Moderação',
        requiresAuth: false,
        hideForAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Login',
        requiresAuth: false,
        hideForAuth: true,
      },
    },
    {
      path: '/home',
      component: AppLayoutDefault,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: {
            title: 'Chat',
            requiresAuth: true,
          },
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('@/views/UserProfileView.vue'),
          meta: {
            title: 'Meu Perfil',
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: 'Página não encontrada',
        requiresAuth: false,
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  document.title = `${to.meta.title || 'Moderated Chat'} | Moderated Chat`

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.hideForAuth && isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router

