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
        <div style="width: auto; height: auto; overflow: hidden">
          <v-card-title>
            {{ activeClickableDataset.title }}
          </v-card-title>
          <app-chart />
          <div class="buttons-container" v-if="graphData">
            <v-btn
              flat
              @click="saveGraphOnDashboard"
              class="add-to-dashboard-button-popup"
            >
              Add to dashboard
            </v-btn>
            <v-btn flat @click="closePopup" class="close-button-popup">
              Close
            </v-btn>
          </div>
        </div>
      </MapboxPopup>
      <dataset-card />
    </mapbox-map>
    <app-sidebar />
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxPopup,
} from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import MapLayer from "@/components/MapLayer.vue";
import AppChart from "@/components/AppChart.vue";

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
    ...mapActions("dashboard", ["addGraph"]),
    ...mapActions("map", [
      "setSeaLevelRiseData",
      "addMapboxLayer",
      "removeMapboxLayer",
    ]),
    ...mapActions("graphs", ["setGraphFeature", "emptyGraphData"]),
    //TODO: @Luis - Implement this method
    saveGraphOnDashboard() {
      const { title } = this.activeClickableDataset;
      const graphData = this.graphData;
      this.addGraph({ graphData, title });
    },
    closePopup() {
      this.isOpen = false;
      this.emptyGraphData();
    },
    onMapClicked(e) {
      this.map = this.$refs.map.map;

      if (this.activeClickableDataset) {
        this.emptyGraphData();
        const { lng, lat } = e.lngLat;
        this.position = [lng, lat];
        const queriedFeatures = this.map.queryRenderedFeatures(e.point);
        this.setGraphFeature({
          queriedFeatures,
          datasetId: this.activeClickableDataset.id,
          ...e.lngLat,
        });
        if (this.graphData) this.isOpen = true;
      }
    },
  },
  watch: {
    graphData() {
      if (this.graphData) {
        this.isOpen = true;
      }
    },
    activeClickableDataset() {
      if (!this.activeClickableDataset) {
        this.isOpen = false;
      }
    },
  },
  computed: {
    ...mapGetters("map", ["mapboxLayers", "activeClickableDataset"]),
    ...mapGetters("datasets", [
      "activeDatasets",
      "activeDatasetIds",
      "activeDatasetValues",
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
  max-width: 15vw;
  min-width: 15vw;
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
