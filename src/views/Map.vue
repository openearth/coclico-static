<template>
  <v-app>
    <mapbox-map
      id="map"
      ref="map"
      @mb-click="onMapClicked"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      :zoom="4"
      :center="[5.2913, 48.1326]"
      map-style="mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d"
    >
      <MapboxNavigationControl :visualizePitch="true" />
      <MapLayer v-for="layer in mapboxLayers" :key="layer.id" :layer="layer" />

      <MapboxPopup
        v-if="isOpen"
        :key="position.join('-')"
        :lng-lat="position"
        anchor="bottom"
        @mb-close="() => (isOpen = false)"
        style="
          width: 30vw;
          height: 38vh;
          display: flex;
          justify-content: center;
        "
        :closeButton="false"
      >
        <pre style="width: 50vw; height: 50vh">
          
          <app-chart />
          <div class="buttons-container" v-if="graphData">
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
import MapLayer from "@/components/MapLayer.vue";
import AppChart from "@/components/AppChart.vue";
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
    AppChart,
  },
  methods: {
    ...mapActions("map", ["addGraphToDashboard", "setSeaLevelRiseData"]),
    ...mapActions("graphs", ["getGraphData", "emptyGraphData"]),
    //TODO: @Luis - Implement this method
    saveGraphOnDashboard() {
      if (
        this.activeClickableDataset.title === "Global Sea Level Projections"
      ) {
        // Save SeaLevelGraph data
        this.addGraphToDashboard({
          type: "seaLevelGraph",
          data: this.graphData, // Sea level rise data
        });
        // TODO: the else if below is for the Coastal Hazard Flood Projection user story
      } else if (this.activeClickableDataset.title === "BLA") {
        // Save FloodExtentGraph data
        this.addGraphToDashboard({
          type: "floodExtentGraph",
          data: {}, // If you have any specific data for the flood extent, include it here
        });
      } else if (
        this.activeClickableDataset.title === "Extreme surge level" ||
        this.activeClickableDataset.title === "Extreme sea level" ||
        this.activeClickableDataset.title === "Shoreline change" ||
        this.activeClickableDataset.title ===
          "Cost benefit coastal adaptation" ||
        this.activeClickableDataset.title === "Coastal flood risk"
      ) {
        // Save FloodExtentGraph data
        this.addGraphToDashboard({
          type: "lineChartZarr",
          data: this.graphData, // If you have any specific data for the flood extent, include it here
        });
      }
    },
    closePopup() {
      this.isOpen = false;
      this.emptyGraphData();
    },
    async onMapClicked(e) {
      this.map = this.$refs.map.map;

      if (this.activeClickableDataset) {
        this.emptyGraphData();
        const { lng, lat } = e.lngLat;
        this.position = [lng, lat];
        const features = this.map.queryRenderedFeatures(e.point)[0];

        this.getGraphData({ lng, lat, features });

        await nextTick();
        this.isOpen = true;
      }
    },
  },
  watch: {
    graphData() {
      if (this.graphData) {
        this.isOpen = true;
      }
    },
  },
  computed: {
    ...mapGetters("map", [
      "mapboxLayers",
      "graphsInDashboard",
      "seaLevelRiseDataFromStore:seaLevelRiseData", // Renamed getter
      "activeDatasets",
      "activeClickableDataset",
    ]),
    ...mapGetters("graphs", ["graphData"]),
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
  margin-bottom: 5px;
}

.add-to-dashboard-button-popup {
  background-color: #293a45;
  color: white !important;
  font-family: "Inter", sans-serif;
  text-transform: none;
  font-weight: 100 !important;
  border-radius: 8px;
  max-width: 10vw;
  min-width: 10vw;
}
.close-button-popup {
  background-color: white;
  color: #293a45 !important;
  font-family: "Inter", sans-serif;
  text-transform: none;
  font-weight: 100 !important;
  border-radius: 8px;
  border: 1px solid #293a45;
  min-width: 10vw;
}
</style>
