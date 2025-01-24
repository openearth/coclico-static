<template>
  <v-chart :option="option" autoresize />
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
});

const option = computed(() => ({
  title: {
    text: "Sea Level Rise",
    left: "center",
  },
  xAxis: {
    type: "category",
    data: props.graphData.time, // Use time for x-axis
    name: "Year",
    nameLocation: "middle",
    nameGap: 25,
  },
  yAxis: {
    type: "value",
    name: "Sea level rise [m]",
    nameLocation: "middle",
    nameGap: 30,
  },
  tooltip: {
    trigger: "axis",
    confine: false,
    formatter: function (params) {
      const formatValue = (value) => parseFloat(value).toFixed(2);
      let tooltip = params[0].axisValue.bold() + "<br/>";
      params.forEach((param) => {
        tooltip += `${param.seriesName} : ${formatValue(param.value)} m<br/>`;
      });
      return tooltip;
    },
  },
  legend: {
    data: props.graphData.scenarios,
    selectedMode: false,
    orient: "horizontal",
    bottom: 0,
    itemStyle: {
      borderWidth: 0.5,
    },
  },
  grid: {
    top: "15%",
    left: "5%",
    right: "5%",
    bottom: "15%",
    containLabel: true,
  },
  series: props.graphData.values,
}));
</script>

<style></style>
