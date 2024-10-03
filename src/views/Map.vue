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
        <pre style="width: 25vw; height: 25vh">
            <!-- General component like GraphComponent -->
            <!-- In this component I could call the other graph components -->
             <!--  -->
              <!-- pass in this component chartData?  -->
               <!-- How do I have the graph data in the sea-level-graph component -->
                <!-- Format them for the flood extent graph -->
                 <!-- Read and pass the data to the extreme surge level -->
            <sea-level-graph v-if="this.activeClickableDataset && this.activeClickableDataset.title === 'Global Sea Level Projections'" :sea-level-rise-data="graphData" />
            <flood-extent-graph v-else-if="this.activeClickableDataset && this.activeClickableDataset.title === 'Extreme surge level'" />
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
import SeaLevelGraph from "@/components/SeaLevelGraph.vue";
import FloodExtentGraph from "@/components/FloodExtentGraph.vue";
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
    SeaLevelGraph,
    FloodExtentGraph,
  },
  methods: {
    ...mapActions("map", ["addGraphToDashboard", "setSeaLevelRiseData"]),
    ...mapActions("graphs", ["getGraphData", "emptyGraphData"]),
    saveGraphOnDashboard() {
      if (
        this.activeClickableDataset.title === "Global Sea Level Projections"
      ) {
        // Save SeaLevelGraph data
        this.addGraphToDashboard({
          type: "seaLevelGraph",
          data: this.graphData, // Sea level rise data
        });
      } else if (this.activeClickableDataset.title === "Extreme surge level") {
        // Save FloodExtentGraph data
        this.addGraphToDashboard({
          type: "floodExtentGraph",
          data: {}, // If you have any specific data for the flood extent, include it here
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
        const { lng, lat } = e.lngLat;
        this.position = [lng, lat];
        const features = this.map.queryRenderedFeatures(e.point);
        // TODO: Pass in the lng, lat also the features.
        console.log("features", features[0]);
        this.getGraphData({ lng, lat });
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
