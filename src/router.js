import Vue from 'vue'
import Router from 'vue-router'
import Layout from './views/Layout.vue'
import CommodityDetail from './components/CommodityDetail'
import OrderCenter from './components/OrderCenter'
import AddNewData from './components/AddNewData'
import CommodityManage from './components/CommodityManage'
import EditData from './components/EditData'
import ResaleDetail from './components/ResaleDetail'
import Register from './components/Register'
import OrderDetail from './components/OrderDetail'

Vue.use(Router)
const router = new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: Layout,
      children: [
        {
          path: 'commoditydetail',
          name: 'commoditydetail',
          component: CommodityDetail
        },
        {
          path: 'ordercenter',
          name: 'ordercenter',
          component: OrderCenter
        },
        {
          path: 'addnewdata',
          name: 'addnewdata',
          component: AddNewData
        },
        {
          path: 'commoditymanage',
          name: 'commoditymanage',
          component: CommodityManage
        },
        {
          path: 'editdata',
          name: 'editdata',
          component: EditData
        },{
          path: 'resaleDetail',
          name: 'resaleDetail',
          component: ResaleDetail
        },
        {
          path: 'register',
          name: 'register',
          component: Register
        },
        {
          path: 'orderdetail',
          name: 'orderdetail',
          component: OrderDetail
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

function jumpTo(target, origin, next) {
  if (target.name !== origin.name) {
    return next(target);
  }
  return next();
}

router.beforeEach(async (to, from, next) => {

  let toPath = to.name
  // console.log(to)
  if (toPath === 'orderdetail' || toPath === 'register') {
    next()
    return
  }
  let user_ontid = sessionStorage.getItem("user_ontid");
  // if no user_ontid then go web_home
  if (!user_ontid) {
    sessionStorage.clear()
    jumpTo({ name: 'Layout' }, to, next)
    return
  }
  next()
})

export default router
