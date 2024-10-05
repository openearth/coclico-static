<template>
  <div class="app-chart__container" v-if="graphData">
    <sea-level-graph
      v-if="activeClickableDataset.id === 'slp'"
      :sea-level-rise-data="graphData"
    />
    <line-chart-zarr
      v-if="zarrLayers.includes(activeClickableDataset.id)"
      :graph-data="graphData"
    />
    <flood-extent-graph
      v-if="activeClickableDataset.id === 'cfhp'"
      :graph-data="graphData"
    />
  </div>
  <div v-else class="app-chart__loader">
    <v-progress-circular
      indeterminate
      color="primary"
      :size="50"
    ></v-progress-circular>
  </div>
</template>
<script>
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import SeaLevelGraph from "./ChartComponents/SeaLevelGraph.vue";
import LineChartZarr from "./ChartComponents/LineChartZarr.vue";
import { mapGetters } from "vuex";

export default {
  components: {
    FloodExtentGraph,
    SeaLevelGraph,
    LineChartZarr,
  },
  data() {
    return {
      zarrLayers: ["ssl", "eesl", "sc"],
    };
  },
  computed: {
    ...mapGetters("graphs", ["graphData"]),
    ...mapGetters("map", ["activeClickableDataset"]),
  },
};
</script>

<style lang="scss">
.app-chart__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
}
.app-chart__container {
  width: 25vw;
  height: 25vh;
}
</style>
