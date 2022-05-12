import Vue from 'vue'
import VueRouter from 'vue-router'
import DataLayers from '../views/DataLayers.vue'
import LandPage from '../views/LandPage.vue'
import StoriesPage from '../views/StoriesPage.vue'
import WorkbenchPage from '../views/WorkbenchPage.vue'
import DatasetIds from '../views/data/DatasetIds.vue'
import LocationIds from '../views/data/locations/LocationIds.vue'


Vue.use(VueRouter)

const routes = [
 {
    path: '/',
    name: 'home',
    redirect: '/data'
  },
  {
    name: 'data',
    path: '/data',
    component: DataLayers, // this is the Platform page
        children: [ {
      path: ':datasetIds',
      component: DatasetIds,
      children: [ {
        path: ':locationId',
        component: LocationIds,
      } ]
    } ]
  },
    {
    name: 'landpage',
    path: '/landpage',
    component: LandPage
  },
    {
    name: 'workbench',
    path: '/workbench',
    component: WorkbenchPage
  },
  {
    name: 'stories',
    path: '/stories',
    component: StoriesPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
