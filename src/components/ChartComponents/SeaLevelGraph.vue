<template>
  <VChart :option="option" autoresize />
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  LegendComponent,
  MarkAreaComponent,
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
  MarkAreaComponent,
]);
const store = useStore();
const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
});
const activeDatasetId = computed(
  () => store.getters["datasets/activeDatasetIds"][0],
);
const values = computed(() =>
  store.getters["datasets/activeDatasetValues"]?.(activeDatasetId.value),
);
const series = computed(() =>
  props.graphData.values.map((item) =>
    item.stack === values.value.scenarios && item.name.startsWith("High")
      ? {
          ...item,
          markArea: {
            itemStyle: {
              opacity: 0.5,
            },
            data: [
              [{ xAxis: values.value.time }, { xAxis: values.value.time }],
            ],
          },
        }
      : item,
  ),
);

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
    data: props.graphData.scenarios.map((scenario) => `High ${scenario}`),
    formatter(name) {
      return name.replace("High ", "");
    },
    selectedMode: false,
    orient: "horizontal",
    bottom: 0,
    itemStyle: {
      borderWidth: 0.5,
    },
  },
  emphasis: {
    focus: "series",
    blurScope: "coordinateSystem",
  },
  grid: {
    top: "15%",
    left: "10%",
    right: "5%",
    bottom: "15%",
    containLabel: true,
  },
  series: series.value,
}));
</script>

<style></style>
