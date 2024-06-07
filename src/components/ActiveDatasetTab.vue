<template>
  <v-card flat class="scrollable-card">
    <v-container
      style="padding-top: 0px"
      v-for="dataset in datasets"
      :key="dataset.id"
    >
      <v-card-text class="layer-title">
        {{ dataset.title }}
        <v-icon small class="summary-info, ml-4"
          >mdi-information-outline</v-icon
        >
      </v-card-text>

      <v-row>
        <v-col cols="6" v-for="summary in dataset.summaries" :key="summary.id">
          <v-row class="align-center">
            <v-col cols="9" class="mr-0">
              <span class="summary-info">{{ summary.id }}</span>
            </v-col>
            <v-col cols="3" class="pa-4">
              <v-icon small class="summary-info"
                >mdi-information-outline</v-icon
              >
            </v-col>
          </v-row>
          <v-select
            v-model="summary.chosenValue"
            :items="summary.allowedValues"
            @update:modelValue="reloadDataset(dataset)"
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <!-- <v-row
        v-if="
          checkLayerType(dataset) === 'vector' &&
          dataset.id === activeLocationDatasetId &&
          activeLegend(dataset)
        "
      > -->
      <v-col>
        <layer-legend :dataset="dataset" />
      </v-col>
      <!-- </v-row> -->
      <v-row class="pb-4">
        <v-col cols="12">
          <p class="text-style">
            Select an element in the map for specific location analysis.
          </p>
        </v-col>
      </v-row>
      <v-divider />
    </v-container>
  </v-card>
</template>
<script>
import LayerLegend from "./LayerLegend.vue";
import { mapActions } from "vuex";

export default {
  props: {
    datasets: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    LayerLegend,
  },
  methods: {
    ...mapActions("map", ["reloadDatasetOnMap"]),
    reloadDataset(dataset) {
      this.reloadDatasetOnMap(dataset);
    },
  },
};
</script>
<style>
.text-style {
  background: #f0f0f0;
}
.scrollable-card {
  max-height: 300px;
  overflow-y: visible;
}
.summary-info {
  color: #a9b0b5;
}
.layer-title {
  font-family: "Inter", sans-serif;
  font-weight: 600;
}
</style>
