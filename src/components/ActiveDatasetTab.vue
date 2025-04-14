<template>
  <VContainer class="datasets">
    <VCard v-for="dataset in datasets" :key="dataset.id" class="dataset">
      <div>
        <VCardTitle class="layer-title">
          {{ dataset.title }}
        </VCardTitle>

        <ActiveDatasetRow :dataset-id="dataset.id" />
      </div>
      <div class="footer">
        <!-- TODO: check if the condition of the old viewer && dataset.id === activeRasterDatasetId should also be implemented here -->
        <VRow v-if="hasLegend(dataset)">
          <VCol class="d-flex justify-center">
            <layer-legend :dataset="dataset" />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" class="pb-8">
            <p class="text-style">
              <VIcon> mdi-cursor-default-click</VIcon>
              Select an element in the map for specific
              <strong>location analysis</strong>.
            </p>
          </VCol>
        </VRow>
      </div>
    </VCard>
    <div v-if="!datasets.length" class="empty text-center mx-16 py-4">
      <p class="font-weight-black">No data layers have been selected.</p>
      <p class="mt-4">
        Explore data categories and activate data layers from the left hand-side
        navigation bar.
      </p>
    </div>
  </VContainer>
</template>

<script setup>
import LayerLegend from "./LayerLegend.vue";
import { useStore } from "vuex";
import { hasLegend } from "@/lib/layers";
import { computed } from "vue";
import ActiveDatasetRow from "@/components/ActiveDatasetRow.vue";

const store = useStore();

const datasets = computed(() =>
  [...store.getters["datasets/activeDatasets"]].filter(
    (dataset) => !dataset?.keywords?.includes("Background Layers"),
  ),
);
</script>

<style scoped lang="scss">
.empty {
  max-width: 50ch;
}

.text-style {
  display: block;
  background: #f0f0f0;
  padding: 5px;
}

.footer {
  justify-self: flex-end;
}

.datasets {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin: 0;
  overflow: visible;
  height: 100%;
  width: 100%;
  max-width: none;
  padding: 0;
  max-height: max-content;
  gap: 1px;
}

.dataset {
  padding: 10px 20px;
  min-width: 450px;
  max-width: 510px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  flex-shrink: 1;
  box-shadow: 1px -1px 2px 0 hsla(0 0% 0% / 10%);
  border-radius: 0;
}

.layer-title {
  font-family: "Inter", sans-serif;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>
