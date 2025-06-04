<template>
  <VLayout>
    <app-sidebar />
    <VMain style="padding-inline: 0">
      <MapboxMap
        id="map"
        key="map"
        ref="mapboxMap"
        :access-token="accessToken"
        :preserve-drawing-buffer="true"
        :map-style="mapstyle"
        @mb-click="onMapClicked"
      >
        <MapboxNavigationControl :visualizePitch="true" />
        <MapLayer
          v-for="layer in mapboxLayers"
          :key="layer.id"
          :layer="layer"
        />
        <Popup :isOpen="isPopupOpen" :position="position" @close="closePopup" />
        <dataset-card />
      </MapboxMap>
    </VMain>
  </VLayout>
</template>

<script setup>
import { useStore } from "vuex";
import { useTour } from "@/lib/useTour";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import MapLayer from "@/components/MapLayer.vue";
import { prepareHighlightSource, setHighlight } from "@/lib/layers";
import { computed, onBeforeMount, onMounted, provide, ref, watch } from "vue";
import { MapboxMap, MapboxNavigationControl } from "@studiometa/vue-mapbox-gl";
import Popup from "@/components/Popup.vue";
import { toast } from "vue-sonner";
import mapstyle from "@/assets/map-styles/style.json";
import { bboxPolygon, center } from "@turf/turf";

const store = useStore();
const position = ref([]);
const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const isPopupOpen = ref(false);
const mapboxMap = ref();
const map = computed(() => mapboxMap.value.map);
const emptyDataToast = ref();
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
    map.value.flyTo({
      center: [lng, lat],
      offset: [-250, 250],
      speed: 1,
    });
    position.value = [lng, lat];
    const queriedFeatures = map.value.queryRenderedFeatures(e.point);
    setFeatures(queriedFeatures, e.point, e.lngLat);
    if (
      graphFeature.value &&
      (hasGeoserverLink.value ? graphFeature.value.features : true)
    ) {
      isPopupOpen.value = true;
      const hasHighlight = setHighlight({
        map: map.value,
        queriedFeatures,
        clickableDatasetsIds: clickableDatasetsIds.value,
      });
      store.dispatch("map/setHighlightedId", hasHighlight);
    } else if (activeClickableDataset.value.id === "ceed_maps") {
      const lauId = queriedFeatures.find(
        (feature) => feature.layer.id === "ceed_maps_geoserver_link",
      ).properties.FID_LAU;
      store.dispatch("map/setSeedLau", lauId);
    } else {
      isPopupOpen.value = false;
      store.dispatch("map/setHighlightedId");
      setHighlight({
        map: map.value,
        queriedFeatures,
        clickableDatasetsIds: clickableDatasetsIds.value,
        event: "empty",
      });
      toast.dismiss(emptyDataToast.value);
      emptyDataToast.value = toast.warning(
        "No data available for this area with these filters.",
      );
    }
  }
}

function closePopup() {
  isPopupOpen.value = false;
  store.dispatch("map/setHighlightedId");
  store.dispatch("graphs/emptyGraphData");
  setHighlight({
    map: map.value,
    highlightedId: store.getters["map/highlightedId"],
  });
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
const hasGeoserverLink = computed(() =>
  mapboxLayers.value.some((layer) => layer.id.endsWith("_geoserver_link")),
);
const ceedBounds = computed(() => store.getters["map/ceed_bounds"]);
watch(ceedBounds, (bounds) => {
  if (clickableDatasetsIds.value.some((id) => id === "ceed_maps"))
    map.value.fitBounds(bounds, {
      center: center(bboxPolygon(bounds)).geometry.coordinates,
    });
});
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
      closePopup();
    }
  },
);
watch(
  () => store.getters["map/activeClickableDataset"],
  (newVal) => {
    if (!newVal) {
      closePopup();
    }
  },
);
onMounted(() => {
  if (store.getters["datasets/dataset"])
    store.dispatch("datasets/loadDatasets");
  map.value.on("load", () => {
    map.value.flyTo({
      center: [5.2913, 48.1326],
      zoom: 4,
      speed: 3,
    });
    prepareHighlightSource(map.value);
  });
});

onBeforeMount(() => {
  store.dispatch("map/setSeaLevelRiseData", seaLevelRiseData.value);
});

useTour({
  id: "welcome",
  refId: "welcome",
  title: "01/11 - Welcome",
  location: "center",
  index: 1,
  description: `Hi! Welcome at the open-source Coastal Climate Core (CoCliCo) Services web platform. This tour will take you along the platforms key features. We are committed to inform users on present-day and future coastal risks, with the goal to improve decision-making on risk management and adaptation. The web platform visualizes state-of-the-art science from hazards to risk & adaptation in a consistent manner. It is carefully designed with both smaller and larger scale stakeholders, i.e. municipalities as well as governmental agencies. For more information on the CoCliCo project please visit: <a href="https://coclicoservices.eu/about/" target="_blank" rel="noopener noreferrer">https://coclicoservices.eu/about/</a>.`,
  onTourStep: () => {},
  onAfterTourStep: () => {},
});

useTour({
  id: "more",
  refId: "more",
  title: "11/11 - Need more information?",
  location: "center",
  index: 11,
  description: `Thank you for visiting the CoCliCo web platform. As informed before, CoCliCo entails more than just this page. Please make sure you will get most of what’s available by leveraging all the information that we outlined in this tour. In case you have questions or comments, feel free to reach out to any of the project partners or drop a message in the contact form on the official website. CoCliCo will be migrating as climate service into the European Digital Twin of the Ocean (EDITO) in the near future to ensure continuity.`,
  onTourStep: () => {},
  onAfterTourStep: () => {},
});

</script>

<style>
:root {
  --drawer-block-margin: 50px;
  --drawer-inline-margin: 10px;
}

#map {
  width: 100%;
  height: 100%;
}

.mapboxgl-ctrl,
.mapboxgl-ctrl-group {
  display: flex;
}
</style>
