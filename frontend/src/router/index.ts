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
const Cashier = () => import('../pages/Cashier.vue')
const Appointments = () => import('../pages/Appointments.vue')
const Sales = () => import('../pages/Sales.vue')

const routes: RouteRecordRaw[] = [
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/', component: Dashboard, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] } },
  { path: '/members', component: Members, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/members/new', component: MemberCreate, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/members/:id/edit', component: MemberCreate, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/members/:id', component: MemberDetail, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/checkins', component: CheckIns, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/beauty', component: BeautyServices, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/barcode', component: Barcode, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/settings', component: Settings, meta: { requiresAuth: true, allowedRoles: ['admin'] } },
  { path: '/products', component: Products, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] } },
  { path: '/inventory', component: Inventory, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] } },
  { path: '/pos', component: POS, meta: { requiresAuth: true, allowedRoles: ['admin', 'reception'] } },
  { path: '/cashier', component: Cashier, meta: { requiresAuth: true, allowedRoles: ['admin', 'reception'] } },
  { path: '/appointments', component: Appointments, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/sales', component: Sales, meta: { requiresAuth: true, allowedRoles: ['admin', 'manager', 'reception'] } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth and Role guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const userRole = user?.role || 'reception' // Default to lowest if missing

  const requiresAuth = to.meta.requiresAuth !== false
  const allowedRoles = to.meta.allowedRoles as string[] | undefined

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else if (isAuthenticated && allowedRoles && !allowedRoles.includes(userRole)) {
    // If authenticated but role not allowed, redirect to a safe page (e.g. Members or first allowed)
    if (userRole === 'reception') {
      next('/members')
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
