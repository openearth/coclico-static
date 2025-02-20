import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import Components from "unplugin-vue-components/vite";
import ViteFonts from "unplugin-fonts/vite";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
    }),
    Components(),
    ViteFonts({
      google: {
        families: [
          {
            name: "Comfortaa",
            styles: "ital,wght@0,100..900;1,100..900",
            defer: true,
          },
          {
            name: "Roboto",
            styles: "ital,wght@0,100..900;1,100..900",
            defer: true,
          },
          {
            name: "Inter",
            styles: "ital,wght@0,100..900;1,100..900",
            defer: true,
          },
        ],
      },
    }),
    svgLoader({
      defaultImport: "component",
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler",
      },
    },
  },
});
