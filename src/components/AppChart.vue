<template>
  <div v-if="graphData" class="app-chart__container">
    <Suspense>
      <component
        :is="graphComponent"
        :key="JSON.stringify(graphData.coords)"
        :graph-data="graphData"
        :property-values="propertyValues"
        :properties="properties"
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
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import BarChart from "./ChartComponents/BarChart.vue";
import LineChart from "./ChartComponents/LineChart.vue";
import PieChart from "@/components/ChartComponents/PieChart.vue";
import { GRAPH_TYPES } from "@/lib/graphs";

const props = defineProps({
  propertyValues: {
    type: Array,
    default: () => [],
  },
  properties: {
    type: Object,
    default: () => ({}),
  },
  graphData: {
    type: Object,
    required: true,
  },
});
const graphComponent = computed(
  () =>
    ({
      [GRAPH_TYPES.FLOOD_EXTEND]: markRaw(FloodExtentGraph),
      [GRAPH_TYPES.PIE_CHART]: markRaw(PieChart),
      [GRAPH_TYPES.BAR_CHART]: markRaw(BarChart),
      [GRAPH_TYPES.LINE_CHART]: markRaw(LineChart),
    })[props.graphData?.graphType],
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
