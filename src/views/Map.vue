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
        style="width: 900px; height: 750px"
        :closeButton="false"
      >
        <pre style="width: 800px; height: 650px">
          <sea-level-graph v-if="firstActiveDataset && firstActiveDataset.title === 'Global Sea Level Projections'" :sea-level-rise-data="graphData" />
          <flood-extent-graph v-else-if="firstActiveDataset && firstActiveDataset.title === 'Extreme surge level'" />
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
    async onFeatureClick(feature) {
      const firstActiveDataset = this.activeDatasets[0];

      if (
        firstActiveDataset &&
        firstActiveDataset.title === "Global Sea Level Projections"
      ) {
        const { geometry, properties } = feature;
        console.log("properties", properties);
        this.position = [...geometry.coordinates];
        //TODO: here I want to have if point layer the zarr call.
        // if raster layer the getFeatureInfo better to make the calls in the store.
        //this.getGraphData();

        await nextTick();

        this.isOpen = true;
      } else if (
        firstActiveDataset &&
        firstActiveDataset.title === "Extreme surge level"
      ) {
        // For "Extreme surge level", we don't fetch sea-level data, but we can process accordingly
        console.log("Extreme surge level dataset clicked");
        this.isOpen = true;
      } else {
        console.log(
          "Clicked feature does not belong to the 'Global Sea Level Projections' or 'Extreme surge level' datasets"
        );
      }
    },
    saveGraphOnDashboard() {
      const firstActiveDataset = this.activeDatasets[0];

      if (firstActiveDataset.title === "Global Sea Level Projections") {
        // Save SeaLevelGraph data
        this.addGraphToDashboard({
          type: "seaLevelGraph",
          data: this.graphData, // Sea level rise data
        });
      } else if (firstActiveDataset.title === "Extreme surge level") {
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
    onMapClicked(e) {
      const firstActiveDataset = this.activeDatasets[0];

      if (
        firstActiveDataset &&
        firstActiveDataset.title === "Global Sea Level Projections"
      ) {
        const { lng, lat } = e.lngLat;
        this.position = [lng, lat];

        this.getGraphData({ lng, lat });
      } else if (
        firstActiveDataset &&
        firstActiveDataset.title === "Extreme surge level"
      ) {
        this.position = [e.lngLat.lng, e.lngLat.lat];
        console.log("Map clicked on Extreme surge level dataset");
      } else {
        console.log("Map clicked, but the active dataset is not interactive.");
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
    ]),
    ...mapGetters("graphs", ["graphData"]),
    firstActiveDataset() {
      return this.activeDatasets[0] || null;
    },
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
  /* gap: 20px; */
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
