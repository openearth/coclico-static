<template>
  <MapboxPopup
    v-if="position && isOpen"
    :key="position.join('-')"
    :closeButton="false"
    :lng-lat="position"
    anchor="bottom"
    style="display: flex; justify-content: center"
  >
    <div>
      <VCardTitle>
        {{ activeClickableDataset.title }}
      </VCardTitle>
      <VCardSubtitle>
        {{ location }}
        {{ formatCoords(graphData?.coords) }}
        <small class="d-flex my-2">
          <VChip
            flat
            size="small"
            class="mr-2"
            v-for="value in Object.values(propertyValues)"
            :key="value"
          >
            {{ value }}
          </VChip>
        </small>
      </VCardSubtitle>
      <app-chart
        :graph-data="graphData"
        :properties="properties"
        :property-values="propertyValues"
      />
      <div class="buttons-container">
        <VBtn
          class="add-to-dashboard-button-popup"
          flat
          @click="saveGraphOnDashboard"
        >
          Add to dashboard
        </VBtn>
        <VBtn class="close-button-popup" flat @click="closePopup"> Close</VBtn>
      </div>
    </div>
  </MapboxPopup>
</template>
<script setup>
import AppChart from "@/components/AppChart.vue";
import { useStore } from "vuex";
import { computed } from "vue";
import { MapboxPopup } from "@studiometa/vue-mapbox-gl";
import { formatCoords, formatLocation } from "@/lib/location";

defineProps({
  isOpen: Boolean,
  position: Array,
});
const emit = defineEmits(["close"]);
const store = useStore();
const activeClickableDataset = computed(
  () => store.getters["map/activeClickableDataset"],
);
const graphData = computed(() => store.getters["graphs/graphData"]);
const graphFeature = computed(() => store.getters["graphs/graphFeature"]);
const closePopup = () => {
  emit("close");
};
const location = computed(() =>
  formatLocation(graphFeature.value, graphData.value),
);
const properties = computed(() =>
  store.getters["datasets/activeDatasetProperties"](
    activeClickableDataset.value.id,
  ),
);
const propertyValues = computed(
  () =>
    store.getters["datasets/activeDatasetValues"](
      activeClickableDataset.value.id,
    ) || {},
);
const saveGraphOnDashboard = () => {
  store.dispatch("dashboard/addGraph", {
    graphData: graphData.value,
    location: location.value,
    propertyValues: propertyValues.value,
    properties: properties.value,
    title: activeClickableDataset.value?.title,
  });
};
</script>
<style>
.mapboxgl-popup-content {
  width: max-content;
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
  font-weight: 400 !important;
  border-radius: 8px;
}

.close-button-popup {
  background-color: white;
  color: #293a45 !important;
  font-family: "Inter", sans-serif;
  text-transform: none;
  font-weight: 400 !important;
  border-radius: 8px;
  border: 1px solid #293a45;
  min-width: 10vw;
}
</style>
