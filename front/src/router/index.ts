import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import ArticleDetailView from '../views/ArticleDetailView.vue'
import MessageView from '../views/MessageView.vue'
import EditView from '../views/EditView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/article/:id',
      name: 'article',
      component: ArticleDetailView,
      props: true,
    },
    { path: '/message', name: 'message', component: MessageView, meta: { sideNav: false } },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { sideNav: false },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { sideNav: false },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    { path: '/edit', redirect: '/edit/new' },
    {
      path: '/edit/new',
      name: 'edit-new',
      component: EditView,
      meta: { requiresAdmin: true, sideNav: false },
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditView,
      meta: { requiresAdmin: true, sideNav: false },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login' }
  }
  if (to.meta?.requiresAdmin) {
    if (auth.isAdmin) return true
    return { name: 'home', query: { forbidden: '1' } }
  }
  return true
})

export default router

