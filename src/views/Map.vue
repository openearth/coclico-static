<template>
  <VApp>
    <MapboxMap
      id="map"
      ref="mapboxMap"
      @mb-click="onMapClicked"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      :zoom="4"
      :center="[5.2913, 48.1326]"
      map-style="mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d"
    >
      <MapboxNavigationControl :visualizePitch="true" />
      <MapLayer v-for="layer in mapboxLayers" :key="layer.id" :layer="layer" />
      <Popup :isOpen="isPopupOpen" :position="position" @close="closePopup" />
      <dataset-card />
    </MapboxMap>
    <app-sidebar />
  </VApp>
</template>

<script setup>
import { useStore } from "vuex";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import MapLayer from "@/components/MapLayer.vue";
import { prepareHighlightSource, setHighlight } from "@/lib/layers";
import { computed, onBeforeMount, onMounted, provide, ref, watch } from "vue";
import { MapboxMap, MapboxNavigationControl } from "@studiometa/vue-mapbox-gl";
import Popup from "@/components/Popup.vue";

const store = useStore();
const position = ref([]);
const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const isPopupOpen = ref(false);
const mapboxMap = ref();
const map = computed(() => mapboxMap.value.map);
provide("map", map);

function setFeatures(queriedFeatures, point, lngLat) {
  store.dispatch("graphs/setGraphFeature", {
    queriedFeatures,
    datasetId: activeClickableDataset.value.id,
    point: point,
    ...lngLat,
  });
}
function onMapClicked(e) {
  if (activeClickableDataset.value) {
    store.dispatch("graphs/emptyGraphData");
    const { lng, lat } = e.lngLat;
    position.value = [lng, lat];
    const queriedFeatures = map.value.queryRenderedFeatures(e.point);
    setFeatures(queriedFeatures, e.point, e.lngLat);
    if (graphFeature.value) {
      isPopupOpen.value = true;
      setHighlight(map.value, queriedFeatures, clickableDatasetsIds.value);
    }
  }
}
function closePopup() {
  isPopupOpen.value = false;
  store.dispatch("graphs/emptyGraphData");
  setHighlight(map.value);
}
const activeClickableDataset = computed(
  () => store.getters["map/activeClickableDataset"],
);
const graphFeature = computed(() => store.getters["graphs/graphFeature"]);
const clickableDatasetsIds = computed(
  () => store.getters["map/clickableDatasetsIds"],
);
const seaLevelRiseData = computed(() => store.getters["map/seaLevelRiseData"]);
const mapboxLayers = computed(() => store.getters["map/mapboxLayers"]);
watch(
  () => store.getters["graphs/graphData"],
  (newVal) => {
    if (newVal) {
      isPopupOpen.value = true;
    }
  },
);
watch(
  () => store.getters["graphs/graphFeature"],
  (newVal) => {
    if (!newVal) {
      isPopupOpen.value = false;
      setHighlight(map.value);
    }
  },
);
watch(
  () => store.getters["map/activeClickableDataset"],
  (newVal) => {
    if (!newVal) {
      isPopupOpen.value = false;
      setHighlight(map.value);
    }
  },
);
onMounted(() => {
  store.dispatch("datasets/loadDatasets");
  map.value.on("load", () => {
    prepareHighlightSource(map.value);
  });
});
onBeforeMount(() => {
  store.dispatch("map/setSeaLevelRiseData", seaLevelRiseData.value);
});
</script>

<style>
#map {
  width: 100%;
  height: 100%;
}
</style>
