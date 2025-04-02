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
  properties: {
    type: Object,
    default: () => ({}),
  },
  propertyValues: {
    type: Object,
    default: () => {},
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
  props.graphData?.id || props.graphData?.datasetId
    ? (
        await import(
          `@/assets/echart-templates/${props.graphData?.id || props.graphData?.datasetId}.js`
        )
      ).default
    : (await import("@/assets/echart-templates/default.js")).default;
const xAxisData = computed(
  () =>
    props.graphData?.xAxis?.data ||
    props.properties.find((prop) => prop.id === "time")?.values?.sort?.(),
);
const option = computed(() => {
  const highlightIndex = xAxisData.value.findIndex(
    (datum) =>
      datum === (props.propertyValues?.time || props.propertyValues?.rp),
  );
  const hasHighlight = props.graphData.series.some((serie) =>
    serie.name.startsWith(props.propertyValues.scenarios),
  );
  return {
    ...baseOptions,
    ...props.graphData,
    series: props.graphData.series
      .filter((series) => series.key !== "abs_affected")
      .map((serie) => {
        return serie.name.startsWith(props.propertyValues?.scenarios)
          ? {
              ...serie,
              data: serie.data.map((datum, index) =>
                index === highlightIndex
                  ? {
                      value: datum,
                      symbolSize: 10,
                    }
                  : datum,
              ),
            }
          : {
              ...serie,
              lineStyle: {
                type: hasHighlight ? "dashed" : "solid",
              },
            };
      }),
    yAxis: {
      ...baseOptions.yAxis,
      ...props.graphData?.yAxis,
    },
    // series:
    xAxis: {
      ...baseOptions.xAxis,
      data: xAxisData.value,
      ...props.graphData?.xAxis,
    },
  };
});
</script>
<style></style>
