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

const option = computed(() => {
  return {
    ...baseOptions,
    ...props.graphData,
    xAxis: {
      ...baseOptions.xAxis,
      ...props.graphData.xAxis,
    },
    yAxis: Array.isArray(props.graphData.yAxis)
      ? props.graphData.yAxis
      : {
          ...baseOptions.yAxis,
          ...props.graphData.yAxis,
        },
  };
});
</script>
<style></style>
