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
      @mb-load="onMapLoad"
    >
      <MapboxNavigationControl :visualizePitch="true" />
      <MapboxLayer
        v-for="layer in mapboxLayers"
        :key="layer.id"
        :id="layer.id"
        :options="layer"
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
  MapboxLayer,
  MapboxPopup,
} from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import GenericGraph from "@/components/GenericGraph.vue";
import { ref, nextTick } from "vue";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      isOpen: ref(false),
      position: ref([0, 0]),
      content: ref(),
      mapboxLayers: [
        {
          id: "example-layer",
          type: "symbol",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [4.9041, 52.3676], // Amsterdam
                  },
                  properties: {
                    title: "Amsterdam",
                    description: "Amsterdam, Netherlands",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [4.4777, 51.9244], // Rotterdam
                  },
                  properties: {
                    title: "Rotterdam",
                    description: "Rotterdam, Netherlands",
                  },
                },
              ],
            },
          },
          layout: {
            "icon-image": "marker-15",
            "icon-size": 1.5,
            "text-field": ["get", "title"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
          },
        },
      ],
    };
  },
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxLayer,
    MapboxPopup,
    AppSidebar,
    DatasetCard,
    GenericGraph,
  },
  methods: {
    ...mapActions("map", ["setGraphInDashboard"]),
    onMapLoad() {
      this.map = this.$refs.map.map;
      this.map.on("click", "example-layer", this.openPopup);
    },
    async openPopup(e) {
      const { features } = e;
      if (!features.length) return;

      const feature = features[0];
      const { geometry, properties } = feature;

      await nextTick();
      this.position = [...geometry.coordinates];
      this.isOpen = true;

      /**
       * Mapbox GL convert's properties values to JSON, so we need to parse them
       * to retrieve any complex data structure such as arrays and objects.
       */
      this.content = Object.fromEntries(
        Object.entries(properties).map(([key, value]) => {
          try {
            return [key, JSON.parse(value)];
          } catch (err) {
            // Silence is golden.
          }

          return [key, value];
        })
      );

      await nextTick();
    },
    saveGraphOnDashboard() {
      this.setGraphInDashboard(true);
    },
  },
  computed: {
    ...mapGetters("map", ["graphInDashboard"]),
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
