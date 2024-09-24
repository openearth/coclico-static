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
        style="width: 900px; height: 750px"
        :closeButton="false"
      >
        <pre style="width: 800px; height: 650px">
          <generic-graph
            :sea-level-rise-data="graphData"
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
import wasmInit, { readParquet } from "parquet-wasm";
import { tableFromIPC } from "apache-arrow";
import { WKBLoader } from "@loaders.gl/wkt";
import { parseSync } from "@loaders.gl/core";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      isOpen: false,
      position: [],
    };
  },
  async mounted() {
    await wasmInit();

    const url =
      "https://storage.googleapis.com/coclico-data-public/coclico/CFHP_LAU_stats/LAU_NUTS_CFHP.parquet";

    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        console.log("buffer", buffer);
        const parquetData = new Uint8Array(buffer);

        // Use parquet-wasm to read the Parquet data into an Arrow table
        const arrowWasmTable = readParquet(parquetData);

        // Convert Wasm memory Arrow table to JS Arrow table
        const arrowTable = tableFromIPC(arrowWasmTable.intoIPCStream());
        console.log("arrowTable", arrowTable);
        // Get all field names in the schema
        const fieldNames = [];
        arrowTable.schema.fields.forEach((field) => {
          fieldNames.push(field.name);
        });
        const geometryColumn = arrowTable.getChild("geometry");
        const propertiesColumns = {};

        // Access all properties dynamically based on field names, excluding "geometry"
        fieldNames.forEach((fieldName) => {
          if (fieldName !== "geometry") {
            propertiesColumns[fieldName] = arrowTable.getChild(fieldName);
          }
        });

        // Extract features for GeoJSON
        const features = [];
        //console.log("arrowTable.length", arrowTable.numRows);
        for (let i = 0; i < arrowTable.numRows; i++) {
          /* --Read geometry-- */
          const geometryBinary = geometryColumn.get(i); // This is the binary Uint8Array

          const geometryGeoJSON = parseSync(geometryBinary, WKBLoader);

          const geometry = {
            type: geometryGeoJSON.type,
            coordinates: geometryGeoJSON.positions.value,
          };

          const properties = {};

          // Dynamically retrieve all property values for each row
          Object.keys(propertiesColumns).forEach((prop) => {
            properties[prop] = propertiesColumns[prop].get(i);
          });

          // Create a GeoJSON feature for each row
          features.push({
            type: "Feature",
            geometry: geometry, // Ensure geometry is in valid GeoJSON format
            properties: properties,
          });
        }
        // Create the final GeoJSON object
        const geojson = {
          type: "FeatureCollection",
          features: features,
        };

        console.log("GeoJSON:", geojson);
      });
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
    ...mapActions("graphs", ["getGraphData", "emptyGraphData"]),
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
      this.addGraphToDashboard(this.graphData);
    },
    closePopup() {
      this.isOpen = false;
      this.emptyGraphData();
    },
    onMapcClicked(e) {
      const { lng, lat } = e.lngLat;
      this.position = [lng, lat];
      this.getGraphData({ lng, lat });
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
