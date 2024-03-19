<template>
  <mapbox-map
    id="map"
    ref="map"
    :access-token="accessToken"
    :preserve-drawing-buffer="true"
    map-style="mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d"
  >
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
  components: {
    MapboxMap,
    MapboxNavigationControl,
  },
};
</script>
<style>
#map {
  width: 100%;
  height: 100%;
}
</style>
