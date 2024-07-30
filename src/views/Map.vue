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
      >
        <pre>{{ content }}</pre>
      </MapboxPopup>
      <dataset-card />
    </mapbox-map>
    <app-sidebar />
  </v-app>
</template>

<script>
import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxPopup,
} from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import MapLayer from "@/components/MapLayer.vue";

import { mapGetters } from "vuex";
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
  },
  computed: {
    ...mapGetters("map", ["mapboxLayers"]),
  },
  methods: {
    async onFeatureClick(feature) {
      const { geometry, properties } = feature;
      await nextTick();
      this.position = [...geometry.coordinates];

      /**
       * Placeholder, replace with chart
       *
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

      this.isOpen = true;
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
