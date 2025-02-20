<template>
  <VCard flat class="scrollable-card">
    <VContainer
      style="padding-top: 0px"
      v-for="dataset in datasets"
      :key="dataset.id"
    >
      <VCardText class="layer-title">
        {{ dataset.title }}
      </VCardText>

      <ActiveDatasetRow :dataset-id="dataset.id" />
      <!-- TODO: check if the condition of the old viewer && dataset.id === activeRasterDatasetId should also be implemented here -->
      <VRow v-if="hasLegend(dataset)">
        <VCol>
          <layer-legend :dataset="dataset" />
        </VCol>
      </VRow>
      <VRow class="pb-4">
        <VCol cols="12">
          <VCardText class="text-style">
            <VIcon> mdi-cursor-default-click </VIcon>
            Select an element in the map for specific
            <strong>location analysis</strong>.
          </VCardText>
        </VCol>
      </VRow>
      <VDivider />
    </VContainer>
    <div v-if="!datasets.length" class="text-center mx-16 pb-4">
      <p class="font-weight-black">No data layers have been selected.</p>
      <p class="mt-4">
        Explore data categories and activate data layers from the left hand-side
        navigation bar.
      </p>
    </div>
  </VCard>
</template>

<script setup>
import LayerLegend from "./LayerLegend.vue";
import { useStore } from "vuex";
import { hasLegend } from "@/lib/layers";
import { computed } from "vue";
import ActiveDatasetRow from "@/components/ActiveDatasetRow.vue";

const store = useStore();

const datasets = computed(() => store.getters["datasets/activeDatasets"]);
</script>

<style>
.text-style {
  background: #f0f0f0;
  padding: 5px;
}
.scrollable-card {
  max-height: 300px;
  overflow-y: visible;
}
.layer-title {
  font-family: "Inter", sans-serif;
  font-weight: 600;
}
</style>
