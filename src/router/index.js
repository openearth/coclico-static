import { createRouter, createWebHistory } from "vue-router";
import MapLayers from "../views/MapLayers.vue";
import Stories from "../views/Stories.vue";

const routes = [
  {
    path: "/",
    name: "data",
    component: MapLayers,
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
