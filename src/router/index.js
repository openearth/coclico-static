import Vue from 'vue'
import VueRouter from 'vue-router'
import DataLayers from '../views/DataLayers.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'data',
    component: DataLayers
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
