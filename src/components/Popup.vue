<template>
  <MapboxPopup
    :key="position.join('-')"
    v-if="position && isOpen && graphData"
    :lng-lat="position"
    anchor="bottom"
    style="display: flex; justify-content: center"
    :closeButton="false"
  >
    <div style="width: auto; height: auto">
      <VCardTitle>
        {{ activeClickableDataset.title }}
      </VCardTitle>
      <app-chart />
      <div class="buttons-container">
        <VBtn
          flat
          @click="saveGraphOnDashboard"
          class="add-to-dashboard-button-popup"
        >
          Add to dashboard
        </VBtn>
        <VBtn flat @click="closePopup" class="close-button-popup"> Close </VBtn>
      </div>
    </div>
  </MapboxPopup>
</template>
<script setup>
import AppChart from "@/components/AppChart.vue";
import { useStore } from "vuex";
import { computed } from "vue";
import { MapboxPopup } from "@studiometa/vue-mapbox-gl";

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
const closePopup = () => {
  emit("close");
};
const saveGraphOnDashboard = () => {
  store.dispatch("dashboard/addGraph", {
    graphData: graphData.value,
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
