<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
});

const chartContainer = ref(null);
const colorPalette = ["#307fb6", "#5e9dc4", "#abcfe5"];
const formattedGraphData = ref([]);

const renderChart = () => {
  const chartDom = chartContainer.value;
  if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
    const myChart = echarts.init(chartDom);

    const option = {
      title: {
        text: "Flood Extent",
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
          data: formattedGraphData.value,
          color: colorPalette,
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

const formatGraphData = () => {
  let total = null;

  for (const key in props.graphData) {
    if (key.includes("total")) {
      total = props.graphData[key];
      break;
    }
  }

  if (total === null) {
    console.error("Total value not found in graphData");
    return;
  }

  for (const key in props.graphData) {
    if (key.includes("more05")) {
      const value = (props.graphData[key] / total) * 100;
      formattedGraphData.value.push({
        value: parseFloat(value.toFixed(2)),
        name: "% flood > 0.5m",
      });
    } else if (key.includes("less05")) {
      const value = (props.graphData[key] / total) * 100;
      formattedGraphData.value.push({
        value: parseFloat(value.toFixed(2)),
        name: "% flood < 0.5m",
      });
    } else if (key.includes("nans")) {
      const value = (props.graphData[key] / total) * 100;
      formattedGraphData.value.push({
        value: parseFloat(value.toFixed(2)),
        name: "% not flooded",
      });
    }
  }
};

onMounted(() => {
  formatGraphData();
  nextTick(() => {
    renderChart();
  });
  window.addEventListener("resize", renderChart);
});
</script>

<style></style>
