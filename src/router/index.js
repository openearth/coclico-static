import { createMemoryHistory, createRouter } from "vue-router";
import Map from "../views/Map.vue";
import Stories from "../views/Stories.vue";
import Disclaimer from '@/components/Disclaimer.vue';

const routes = [
  {
    path: "/",
    name: "home",
    redirect: "/data",
  },
  {
    path: "/data",
    name: "data",
    component: Map,
  },
  {
    path: "/stories",
    name: "stories",
    component: Stories,
  },
  {
    path: '/terms-of-use',
    name: 'disclaimer',
    component: Disclaimer
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
