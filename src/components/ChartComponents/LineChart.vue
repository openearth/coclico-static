<template>
  <VChart :option="option" autoresize />
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
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

const baseOptions = computed(() => {
  try {
    return defineAsyncComponent(
      `@/assets/echart-templates/${props.graphData.id}.js`,
    );
  } catch {
    return defineAsyncComponent("@/assets/echart-templates/default.js");
  }
});

const option = computed(() => {
  return {
    ...baseOptions.value,
    ...props.graphData,
    xAxis: {
      ...baseOptions.value.xAxis,
      ...props.graphData.xAxis,
    },
    yAxis: Array.isArray(props.graphData.yAxis)
      ? props.graphData.yAxis
      : {
          ...baseOptions.value.yAxis,
          ...props.graphData.yAxis,
        },
  };
});
</script>
<style></style>
