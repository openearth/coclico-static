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
  MapboxLayer,
  MapboxPopup,
} from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";

import { mapGetters } from "vuex";

import { ref, nextTick } from "vue";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      isOpen: ref(false),
      position: ref([0, 0]),
      content: ref(),
    };
  },
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxLayer,
    MapboxPopup,
    AppSidebar,
    DatasetCard,
  },
  computed: {
    ...mapGetters("map", ["mapboxLayers"]),
  },
  methods: {
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
