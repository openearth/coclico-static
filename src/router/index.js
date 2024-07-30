import { createRouter, createWebHistory } from "vue-router";
import Map from "../views/Map.vue";
import Stories from "../views/Stories.vue";

const routes = [
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
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
