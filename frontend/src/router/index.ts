import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Lazy loading for better performance
const Dashboard = () => import('../pages/Dashboard.vue')
const Members = () => import('../pages/Members.vue')
const MemberCreate = () => import('../pages/MemberCreate.vue')
const MemberDetail = () => import('../pages/MemberDetail.vue')
const CheckIns = () => import('../pages/CheckIns.vue')
const BeautyServices = () => import('../pages/BeautyServices.vue')
const Barcode = () => import('../pages/Barcode.vue')
const Settings = () => import('../pages/Settings.vue')
const Login = () => import('../pages/Login.vue')
const Products = () => import('../pages/Products.vue')
const Inventory = () => import('../pages/Inventory.vue')
const POS = () => import('../pages/POS.vue')
const Appointments = () => import('../pages/Appointments.vue')

const routes: RouteRecordRaw[] = [
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/members', component: Members, meta: { requiresAuth: true } },
  { path: '/members/new', component: MemberCreate, meta: { requiresAuth: true } },
  { path: '/members/:id/edit', component: MemberCreate, meta: { requiresAuth: true } },
  { path: '/members/:id', component: MemberDetail, meta: { requiresAuth: true } },
  { path: '/checkins', component: CheckIns, meta: { requiresAuth: true } },
  { path: '/beauty', component: BeautyServices, meta: { requiresAuth: true } },
  { path: '/barcode', component: Barcode, meta: { requiresAuth: true } },
  { path: '/settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/products', component: Products, meta: { requiresAuth: true } },
  { path: '/inventory', component: Inventory, meta: { requiresAuth: true } },
  { path: '/pos', component: POS, meta: { requiresAuth: true } },
  { path: '/appointments', component: Appointments, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

