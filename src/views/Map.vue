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
        <pre style="width: auto; height: auto; overflow: hidden">

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
import mapboxgl from "mapbox-gl";
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
    ...mapActions("graphs", ["getGraphData", "emptyGraphData"]),
    //TODO: @Luis - Implement this method
    saveGraphOnDashboard() {
      if (
        this.activeClickableDataset.title === "Global Sea Level Projections"
      ) {
        this.addGraph({
          type: "seaLevelGraph",
          data: this.graphData, // Sea level rise data
        });
        // TODO: the else if below is for the Coastal Hazard Flood Projection user story
      } else if (
        this.activeClickableDataset.title ===
        "Inundation distribution during flood events"
      ) {
        this.addGraph({
          type: "floodExtentGraph",
          data: this.graphData,
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
        this.addGraph({
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
        //TODO: after Demo make this implementation more generic
        if (this.activeClickableDataset.id === "cfhp") {
          if (this.map.getLayer("cfhp_focused")) {
            this.map.removeLayer("cfhp_focused");
            this.map.removeSource("cfhp_focused");
          }

          //when click load on the map a new layer from the features
          //fly to its extent
          const coordinates = features.geometry.coordinates;
          const bounds = new mapboxgl.LngLatBounds();

          coordinates[0].forEach((coord) => {
            bounds.extend(coord);
          });
          console.log("bounds", bounds);
          const center = bounds.getCenter();
          // get bounds of the feature

          this.map.flyTo({
            center: center,
            zoom: 10,
            essential: true,
          });
          //add a new layer to the map
          // TODO: check if there is a better way. FOR NOW DO IT LIKE THIS
          const mapboxLayer = {
            id: "cfhp_focused",
            type: "fill",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: features.geometry,
              },
            },
            paint: {
              "fill-color": "#088",
              "fill-opacity": 0.8,
            },
          };
          this.addMapboxLayer(mapboxLayer);
        }

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
