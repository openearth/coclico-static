<template>
  <mapbox-map
    style="height: 100vh"
    :access-token="accessToken"
    :preserve-drawing-buffer="true"
    map-style="mapbox://styles/mapbox/streets-v12"
  >
    <!-- "mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d" -->
    <MapboxNavigationControl :visualizePitch="true" />
  </mapbox-map>
</template>

<script>
import { MapboxMap, MapboxNavigationControl } from "@studiometa/vue-mapbox-gl";

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
  },
};
</script>
