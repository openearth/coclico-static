<template>
  <VChart v-if="option?.id" :option="option" autoresize />
</template>

<script setup>
import { computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { useStore } from "vuex";

const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
});
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const baseOptions =
  (await import(`@/assets/echart-templates/${props.graphData.id}.js`))
    .default || (await import("@/assets/echart-templates/default.js")).default;
const store = useStore();
const properties = computed(() =>
  store.getters["datasets/activeDatasetProperties"](props.graphData.id),
);
const option = computed(() => {
  return {
    ...baseOptions,
    ...props.graphData,
    series: props.graphData.series.filter(
      (series) => series.key !== "abs_affected",
    ),
    xAxis: {
      ...baseOptions.xAxis,
      data: properties.value.find((prop) => prop.id === "time").values.sort(),
    },
  };
});
</script>
<style></style>
