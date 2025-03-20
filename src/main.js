import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/assets/styles/global.css";

createApp(App).use(vuetify).use(router).use(store).mount("#app");
