<template>
  <div v-if="graphData" class="app-chart__container">
    <Suspense>
      <component
        :is="graphComponent"
        :key="JSON.stringify(graphData.coords)"
        :graph-data="graphData"
      />
      <template #fallback>
        <div class="app-chart__loader">
          <VProgressCircular :size="50" color="primary" indeterminate />
        </div>
      </template>
    </Suspense>
  </div>
  <div v-else class="app-chart__loader">
    <VProgressCircular
      :size="50"
      color="primary"
      indeterminate
    ></VProgressCircular>
  </div>
</template>
<script setup>
import { computed, markRaw } from "vue";
import { useStore } from "vuex";
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import BarChart from "./ChartComponents/BarChart.vue";
import LineChart from "./ChartComponents/LineChart.vue";
import PieChart from "@/components/ChartComponents/PieChart.vue";
import { GRAPH_TYPES } from "@/lib/graphs";

const store = useStore();
const graphData = computed(() => store.getters["graphs/graphData"]);
const graphComponent = computed(
  () =>
    ({
      [GRAPH_TYPES.FLOOD_EXTEND]: markRaw(FloodExtentGraph),
      [GRAPH_TYPES.PIE_CHART]: markRaw(PieChart),
      [GRAPH_TYPES.BAR_CHART]: markRaw(BarChart),
      [GRAPH_TYPES.LINE_CHART]: markRaw(LineChart),
    })[graphData.value?.graphType],
);
</script>

<style>
.app-chart__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 500px;
  height: 400px;
}

.app-chart__container {
  height: 400px;
  width: 500px;
}
</style>
