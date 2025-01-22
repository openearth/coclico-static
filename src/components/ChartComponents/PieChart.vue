<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>

<script setup>
/**
 * @typedef { import("vue").Ref } Ref
 */
import * as echarts from "echarts";
import { onMounted, ref } from "vue";

/** @type {Ref<HTMLDivElement>} */
const chartContainer = ref(null);
const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  graphData: {
    type: Array,
    required: true,
  },
  colorPalette: {
    type: Array,
    default: () => ["#307fb6", "#5e9dc4", "#abcfe5"],
  },
});

/** Renders the chart to the chart container div*/
const renderChart = () => {
  const chartDom = chartContainer.value;
  if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
    const myChart = echarts.init(chartDom);

    const option = {
      title: {
        text: props.title,
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },

      series: [
        {
          type: "pie",
          radius: "70%",
          top: 30,
          data: props.graphData.values,
          color: props.colorPalette,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    myChart.setOption(option);
  }
};
onMounted(() => {
  renderChart();
  window.addEventListener("resize", renderChart);
});
</script>

<style></style>
