<template>
  <v-app>
    <mapbox-map
      id="map"
      ref="map"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      map-style="mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d"
      :zoom="4"
      :center="[5.2913, 48.1326]"
    >
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
  components: {
    MapboxMap,
    MapboxNavigationControl,
    AppSidebar,
  },
};
</script>
<style>
#map {
  width: 100%;
  height: 100%;
}
</style>
