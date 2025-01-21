<template>
  <v-card flat class="scrollable-card">
    <v-container
      style="padding-top: 0px"
      v-for="dataset in datasets"
      :key="dataset.id"
    >
      <v-card-text class="layer-title">
        {{ dataset.title }}
        <v-tooltip
          location="bottom"
          max-width="450px"
          :text="dataset.description"
        >
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" small class="summary-info, ml-4"
              >mdi-information-outline</v-icon
            >
          </template>
        </v-tooltip>
      </v-card-text>

      <ActiveDatasetRow :dataset-id="dataset.id" />
      <!-- TODO: check if the condition of the old viewer && dataset.id === activeRasterDatasetId should also be implemented here -->
      <v-row v-if="hasLegend(dataset)">
        <v-col>
          <layer-legend :dataset="dataset" />
        </v-col>
      </v-row>
      <v-row class="pb-4">
        <v-col cols="12">
          <v-card-text class="text-style">
            <v-icon> mdi-cursor-default-click </v-icon>
            Select an element in the map for specific
            <strong>location analysis</strong>.
          </v-card-text>
        </v-col>
      </v-row>
      <v-divider />
    </v-container>
  </v-card>
</template>

<script setup>
import LayerLegend from "./LayerLegend.vue";
import { useStore } from "vuex";
import { hasLegend } from "@/lib/layers";
import { computed } from "vue";
import ActiveDatasetRow from "@/components/ActiveDatasetRow.vue";

const store = useStore();

const datasets = computed(() => store.getters["map/activeDatasets"]);
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
