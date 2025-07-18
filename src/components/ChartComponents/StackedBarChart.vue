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
  baseOptions = (await import("@/assets/echart-templates/default.js")).default;
}
const store = useStore();
const properties = computed(() =>
  store.getters["datasets/activeDatasetProperties"](
    props.graphData?.id || props.graphData?.datasetId,
  ),
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

const readableSeries = computed(() =>
  props.graphData?.series.map((item) => {
    const readableName = item.name
      .split(" ")
      .map((part) => labelsMap.value[part] || part)
      .join(" ");

    return {
      ...item,
      name: readableName,
      showInLegend: item.showInLegend,
      ...(props.propertyValues.scenarios.includes(item.stack) &&
      item.name.startsWith("High")
        ? {
            markArea: {
              itemStyle: { opacity: 0.25 },
              data: [
                [
                  { xAxis: props.propertyValues.time },
                  { xAxis: props.propertyValues.time },
                ],
              ],
            },
          }
        : {}),
    };
  })
);

const option = computed(() => {
  const legendSeries = readableSeries.value.filter((s) => s.showInLegend);
  return {
    ...baseOptions,
    ...props?.graphData,
    series: readableSeries.value,
    legend: {
      ...baseOptions?.legend,
      data: legendSeries.map((s) => s.name),
      formatter: (name) => name.replace(/^High /, "")
    },
    xAxis: {
      ...baseOptions.xAxis,
      data: properties.value
        .find((prop) => prop.id === "time")
        .values.sort()
        .map((val) => labelsMap.value[val] || val),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
      nameGap: 40
    },
  };
});
</script>
