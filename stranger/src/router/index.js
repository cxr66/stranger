import Vue from 'vue'
import Router from 'vue-router' 

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: ()=>import('@/components/login')
    },
    {
      path: '/index',
      name: 'index',
      component: ()=>import('@/components/index')
    },
    {
      path: '/person',
      name: 'person',
      component: ()=>import('@/components/person')
    },
    {
      path: '/camera',
      name: 'camera',
      component: ()=>import('@/components/camera')
    }
  ]
})
