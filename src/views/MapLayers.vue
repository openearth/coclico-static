<template>
  <v-app>
    <mapbox-map
      style="height: 100vh"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      map-style="mapbox://styles/mapbox/streets-v12"
      :zoom="4"
      :center="[5.2913, 48.1326]"
    >
      <!-- "mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d" -->
      <MapboxNavigationControl :visualizePitch="true" />
    </mapbox-map>
    <app-sidebar />
  </v-app>
</template>

<script>
import { MapboxMap, MapboxNavigationControl } from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    };
  },
  mounted() {
    console.log("view has been mounted");
  },
  components: {
    MapboxMap,
    MapboxNavigationControl,
    AppSidebar,
  },
};
</script>
