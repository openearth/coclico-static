import { createMemoryHistory, createRouter } from "vue-router";
import Map from "../views/Map.vue";
import Stories from "../views/Stories.vue";

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
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
