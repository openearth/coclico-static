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
import { useStore } from "vuex";

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

const activeDatasetId = computed(
  () => store.getters["datasets/activeDatasetIds"][0],
);
const values = computed(() =>
  store.getters["datasets/activeDatasetValues"]?.(activeDatasetId.value),
);

const store = useStore();
const properties = computed(() =>
  store.getters["datasets/activeDatasetProperties"](props.graphData.id),
);
const option = computed(() => {
  const highlightIndex = props.graphData.xAxis.data.findIndex(
    (datum) => datum === (values.value?.time || values.value?.rp),
  );
  const hasHighlight = props.graphData.series.some((serie) =>
    serie.name.startsWith(values.value.scenarios),
  );
  return {
    ...baseOptions,
    ...props.graphData,
    series: props.graphData.series.filter(
      (series) => series.key !== "abs_affected",
    ),
    yAxis: {
      ...baseOptions.yAxis,
      ...props.graphData?.yAxis,
    },
    series: props.graphData.series.map((serie) => {
      return serie.name.startsWith(values.value.scenarios)
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
    xAxis: {
      ...baseOptions.xAxis,
      data: properties.value
        .find((prop) => prop.id === "time")
        ?.values?.sort?.(),
      ...props.graphData?.xAxis,
    },
  };
});
</script>
<style></style>
