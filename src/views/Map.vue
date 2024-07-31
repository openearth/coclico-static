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
      <MapLayer
        v-for="layer in mapboxLayers"
        :key="layer.id"
        :layer="layer"
        @click="onFeatureClick"
      />

      <MapboxPopup
        v-if="isOpen"
        :key="position.join('-')"
        :lng-lat="position"
        anchor="bottom"
        @mb-close="() => (isOpen = false)"
        style="width: 450px; height: 450px"
      >
        <pre style="width: 450px; height: 350px">
          <generic-graph />
          <v-btn @click="saveGraphOnDashboard" class="button-popup"> Move to dashboard </v-btn>
        </pre>
      </MapboxPopup>
      <dataset-card />
    </mapbox-map>
    <app-sidebar />
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxPopup,
} from "@studiometa/vue-mapbox-gl";

import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import GenericGraph from "@/components/GenericGraph.vue";
import MapLayer from "@/components/MapLayer.vue";
import { nextTick } from "vue";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      isOpen: false,
      position: [],
    };
  },
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapLayer,
    MapboxPopup,
    AppSidebar,
    DatasetCard,
    GenericGraph,
  },
  methods: {
    ...mapActions("map", ["setGraphInDashboard"]),
    async onFeatureClick(feature) {
      const { geometry, properties } = feature;
      console.log("propertie", properties);

      await nextTick();
      this.position = [...geometry.coordinates];
      this.isOpen = true;
    },
    saveGraphOnDashboard() {
      this.setGraphInDashboard(true);
    },
  },
  computed: {
    ...mapGetters("map", ["mapboxLayers", "graphInDashboard"]),
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 100%;
}
.mapboxgl-popup-content {
  width: fit-content;
}

.button-popup {
  background-color: rgb(var(--v-theme-primary));
  border: none;
  color: rgb(var(--v-theme-white100));
}
</style>
