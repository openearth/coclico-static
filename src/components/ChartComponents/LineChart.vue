<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>
<script setup>
import { nextTick, onMounted } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  graphData: {
    type: Object,
    required: true,
  },
});
const options = {};
onMounted(() => {
  this.getBaseOption();
  // this.options will be a combination of baseOptions and graphData
  this.options = {
    ...this.baseOptions,
    ...props.graphData,
    xAxis: {
      ...this.baseOptions.xAxis,
      ...props.graphData.xAxis,
    },
    yAxis: {
      ...this.baseOptions.yAxis,
      ...props.graphData.yAxis,
    },
  };
  nextTick(() => {
    this.renderChart(this.options);
  });
  window.addEventListener("resize", this.renderChart);
});
const getBaseOption = () => {
  try {
    this.baseOptions =
      require(`@/assets/echart-templates/${props.graphData.id}.js`).default;
  } catch {
    this.baseOptions = require("@/assets/echart-templates/default.js").default;
  }
};
const renderChart = (option) => {
  const chartDom = this.$refs.chartContainer;
  if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
    const myChart = echarts.init(chartDom);
    myChart.setOption(option);
  }
};
</script>
<style></style>
