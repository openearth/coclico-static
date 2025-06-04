<template>
  <VChart :option="option" autoresize />
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
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
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const props = defineProps({
  dataset: {
    type: String,
    required: false,
  },
  graphData: {
    type: Object,
    required: true,
  },
  colorPalette: {
    type: Array,
    default: () => ["#004c6d", "#3d708f", "#6996b3", "#94bed9", "#c1e7ff"],
  },
});

const store = useStore();

const properties = computed(() =>
  store.getters["datasets/activeDatasetProperties"](props.graphData.datasetId)
);

const labelsMap = computed(() => {
  const map = {};
  for (const prop of properties.value || []) {
    Object.entries(prop.labels || {}).forEach(([key, label]) => {
      map[key] = label;
    });
  }
  return map;
});

const baseOptions =
  props.graphData?.id || props.graphData?.datasetId
    ? (
        await import(
          `@/assets/echart-templates/${props.graphData?.id || props.graphData?.datasetId}.js`
        )
      ).default
    : (await import("@/assets/echart-templates/default.js")).default;

const option = computed(() => {
  return {
    ...baseOptions,
    ...props?.graphData,
    legend: {
      ...baseOptions?.legend,
    },
    series: baseOptions.series.map((serie) => ({
      ...serie,
      color: props.colorPalette,
      data: props.graphData.values.map((item) => ({
        ...item,
        name: labelsMap.value[item.name] || item.name,
      })),
    })),
  };
});
</script>
