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
import { useStore } from "vuex";

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
});
const baseOptions =
  (
    await import(
      `@/assets/echart-templates/${props.graphData?.id || props.graphData?.datasetId}.js`
    )
  ).default || (await import("@/assets/echart-templates/default.js")).default;
const store = useStore();
const properties = computed(() =>
  store.getters["datasets/activeDatasetProperties"](
    props.graphData?.id || props.graphData?.datasetId,
  ),
);
const option = computed(() => {
  return {
    ...baseOptions,
    ...props?.graphData,
    legend: {
      ...baseOptions?.legend,
      color: props.graphData?.colorPalette,
      data: props.graphData.scenarios.map((scenario) => `High ${scenario}`),
    },
    series: props?.graphData?.series,
    xAxis: {
      ...baseOptions.xAxis,
      data: properties.value.find((prop) => prop.id === "time").values.sort(),
    },
  };
});
</script>
