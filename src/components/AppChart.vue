<template>
  <div class="app-chart__container" v-if="graphData">
    <component
      :is="graphComponent"
      :graph-data="graphData"
      :key="JSON.stringify(graphData.coords)"
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
<script setup>
import { computed, markRaw } from "vue";
import { useStore } from "vuex";
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import SeaLevelGraph from "./ChartComponents/SeaLevelGraph.vue";
import LineChartZarr from "./ChartComponents/LineChartZarr.vue";
import PieChart from "@/components/ChartComponents/PieChart.vue";
import { GRAPH_TYPES } from "@/lib/graphs";

const store = useStore();
const graphData = computed(() => store.getters["graphs/graphData"]);
const graphComponent = computed(
  () =>
    ({
      [GRAPH_TYPES.FLOOD_EXTEND]: markRaw(FloodExtentGraph),
      [GRAPH_TYPES.PIE_CHART]: markRaw(PieChart),
      [GRAPH_TYPES.SEA_LEVEL_RISE]: markRaw(SeaLevelGraph),
      [GRAPH_TYPES.LINE_CHART]: markRaw(LineChartZarr),
    }[graphData.value?.graphType])
);
</script>

<style>
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
