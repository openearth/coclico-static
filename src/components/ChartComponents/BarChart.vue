<template>
  <VChart :option="option" autoresize />
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { computed } from "vue";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);
const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
  properties: {
    type: Object,
    default: () => ({}),
  },
  propertyValues: {
    type: Object,
    default: () => ({}),
  },
});
let baseOptions = {};
try {
  baseOptions = (
    await import(
      `@/assets/echart-templates/${props.graphData?.id || props.graphData?.datasetId}.js`
    )
  ).default;
} catch (e) {
  console.info(e);
  baseOptions = (await import("@/assets/echart-templates/default.js")).default;
}
const option = computed(() => {
  return {
    ...baseOptions,
    ...props?.graphData,
    legend: {
      ...baseOptions?.legend,
      color: props.graphData?.colorPalette,
      data: props.graphData?.scenarios?.map((scenario) => `High ${scenario}`),
    },
    series: props.graphData?.series,
    xAxis: {
      ...baseOptions.xAxis,
      ...props.graphData.xAxis,
    },
  };
});
</script>
