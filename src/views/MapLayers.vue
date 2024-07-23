<template>
  <v-app>
    <mapbox-map
      id="map"
      ref="map"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      :zoom="4"
      :center="[5.2913, 48.1326]"
      map-style="mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d"
    >
      <MapboxNavigationControl :visualizePitch="true" />
      <MapboxLayer
        v-for="layer in mapboxLayers"
        :key="layer.id"
        :id="layer.id"
        :options="layer"
      />
      <dataset-card />
    </mapbox-map>
    <app-sidebar />
  </v-app>
</template>

<script>
import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxLayer,
} from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";

import { mapGetters } from "vuex";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    };
  },
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxLayer,
    AppSidebar,
    DatasetCard,
  },
  computed: {
    ...mapGetters("map", ["mapboxLayers"]),
  },
  watch: {
    map: {
      handler(value) {
        if (value) {
          this.addEventsToMap();
        }
      },
    },
  },
  methods: {
    onMouseEnter() {
      console.log("enter mouse");
    },
    addEventsToMap() {
      this.map.on("mouseenter", this.layer.id, this.onMouseEnter);
    },
  },
};
</script>
<style>
#map {
  width: 100%;
  height: 100%;
}
</style>
