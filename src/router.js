import Vue from 'vue'
import Router from 'vue-router'
import Layout from './views/Layout.vue'
import CommodityDetail from './components/CommodityDetail'
import OrderCenter from './components/OrderCenter'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: Layout,
      children: [
        {
          path: 'commoditydetail',
          component: CommodityDetail
        },
        {
          path: 'ordercenter',
          component: OrderCenter
        }
      ]
    }
  ]
})
