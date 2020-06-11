import Vue from 'vue'
import VueRouter from 'vue-router'

// 避免重复点击报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}


const Login = () => import("../views/Login")
const Home = () => import("../views/Home")
const Welcome = () => import("../views/Welcome")
const Users = () => import("../views/Users")
const Rights = () => import("../views/Rights")
const Roles = () => import("../views/Roles")
const Category = () => import("../views/Category")
const Params = () => import("../views/Params")
const Goods = () => import("../views/Goods")
const AddGoods = () => import("../views/AddGoods")
const Orders = () => import("../views/Orders")
const Reports = () => import("../views/Reports")

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: Home,
    children: [
      {path: '/', redirect: 'welcome'},
      {path: 'welcome', component: Welcome},
      {path: '/users', component: Users},
      {path: '/rights', component: Rights},
      {path: '/roles', component: Roles},
      {path: '/categories', component: Category},
      {path: '/params', component: Params},
      {path: '/goods', component: Goods},
      {path: '/goods/add', component: AddGoods},
      {path: '/orders', component: Orders},
      {path: '/reports', component: Reports}
    ]
  },
  {
    path: '/login',
    component: Login
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // 如果访问的是登录页面，直接登录
  if (to.path === '/login') return next()
  // 如果访问的时候没有token,则其他的页面禁止访问,直接跳转到login页面
  if (!window.sessionStorage.getItem("token")) return next('/login')
  //其他情况直接放行
  next()
})

export default router
