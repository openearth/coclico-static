<template>
  <MapboxPopup
    v-if="position && isOpen"
    :key="position.join('-')"
    :closeButton="false"
    :lng-lat="position"
    anchor="bottom"
    style="display: flex; justify-content: center"
  >
    <div style="width: auto; height: auto">
      <VCardTitle>
        {{ activeClickableDataset.title }}
      </VCardTitle>
      <VCardSubtitle>
        {{ graphFeature?.features?.properties?.GISCO_ID }}
        ({{ roundCoord(graphData.coords.lat) }},
        {{ roundCoord(graphData.coords.lng) }})
      </VCardSubtitle>
      <app-chart />
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
import { roundCoord } from "../lib/coords";

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

const saveGraphOnDashboard = () => {
  store.dispatch("dashboard/addGraph", {
    graphData: graphData.value,
    GISCO_ID: graphFeature.value?.features?.properties?.GISCO_ID,
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
  max-width: 15vw;
  min-width: 15vw;
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
