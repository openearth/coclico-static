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
import { pieChartTemplate } from "@/assets/echart-templates/pie";
import VChart from "vue-echarts";

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
    default: () => ["#307fb6", "#5e9dc4", "#abcfe5"],
  },
});

const option = computed(() =>
  pieChartTemplate({
    datasetId: props.graphData.datasetId,
    values: props.graphData.values,
    colorPalette: props.colorPalette,
  }),
);
</script>
