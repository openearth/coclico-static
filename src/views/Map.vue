<template>
  <v-app>
    <mapbox-map
      id="map"
      ref="map"
      @mb-click="onMapcClicked"
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
        style="width: 470px; height: 450px"
        :closeButton="false"
      >
        <pre style="width: 450px; height: 350px">
          <generic-graph
            :sea-level-rise-data="seaLevelRiseData"
          />
          <div class="buttons-container">
            <v-btn flat @click="saveGraphOnDashboard" class="add-to-dashboard-button-popup"> Add to dashboard </v-btn>
            <v-btn flat @click="closePopup" class="close-button-popup"> Close </v-btn>
          </div>
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
      seaLevelRiseData: {
        xAxisData: ["2010", "2020", "2030", "2040", "2050", "2060"],
        ssp3LowData: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
        ssp3MedData: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65],
        ssp3HighData: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65],
        ssp4LowData: [0.25, 0.35, 0.5, 0.6, 0.75, 0.9],
        ssp4MedData: [0.2, 0.3, 0.4, 0.55, 0.7, 0.8],
        ssp4HighData: [0.2, 0.3, 0.4, 0.55, 0.7, 0.8],
        ssp5LowData: [0.3, 0.45, 0.55, 0.75, 0.9, 1],
        ssp5MedData: [0.25, 0.355, 0.5, 0.65, 0.8, 0.95],
        ssp5HighData: [0.25, 0.355, 0.5, 0.65, 0.8, 0.95],
      },
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
    ...mapActions("map", ["addGraphToDashboard", "setSeaLevelRiseData"]),
    ...mapActions("graphs", ["getGraphData"]),
    async onFeatureClick(feature) {
      const { geometry, properties } = feature;
      console.log("properties", properties);
      this.position = [...geometry.coordinates];
      //TODO: here I want to have if point layer the zarr call.
      // if raster layer the getFeatureInfo better to make the calls in the store.
      //this.getGraphData();

      await nextTick();

      this.isOpen = true;
    },
    saveGraphOnDashboard() {
      // this.setSeaLevelRiseData(this.seaLevelRiseData);
      this.addGraphToDashboard(this.seaLevelRiseData);
    },
    closePopup() {
      this.isOpen = false;
    },
    onMapcClicked(e) {
      const { lng, lat } = e.lngLat;

      console.log("lng", lng, lat);
      this.getGraphData({ lng, lat });
    },
  },
  computed: {
    ...mapGetters("map", [
      "mapboxLayers",
      "graphsInDashboard",
      "seaLevelRiseDataFromStore:seaLevelRiseData", // Renamed getter
    ]),
  },
  created() {
    this.setSeaLevelRiseData(this.seaLevelRiseData);
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

.buttons-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.add-to-dashboard-button-popup {
  background-color: #293a45;
  color: white !important;
  font-family: "Inter", sans-serif;
  text-transform: none;
  font-weight: 100 !important;
  border-radius: 8px;
  min-width: 180px;
}
.close-button-popup {
  background-color: white;
  color: #293a45 !important;
  font-family: "Inter", sans-serif;
  text-transform: none;
  font-weight: 100 !important;
  border-radius: 8px;
  border: 1px solid #293a45;
  min-width: 180px;
}
</style>
