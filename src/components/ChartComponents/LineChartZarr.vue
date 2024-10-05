<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>
<script>
import { nextTick } from "vue";
import * as echarts from "echarts";

export default {
  props: {
    graphData: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      options: {},
    };
  },
  mounted() {
    this.getBaseOption();
    // this.options will be a combination of baseOptions and graphData
    this.options = {
      ...this.baseOptions,
      ...this.graphData,
      xAxis: {
        ...this.baseOptions.xAxis,
        ...this.graphData.xAxis,
      },
      yAxis: {
        ...this.baseOptions.yAxis,
        ...this.graphData.yAxis,
      },
    };
    nextTick(() => {
      this.renderChart(this.options);
    });
    window.addEventListener("resize", this.renderChart);
  },
  methods: {
    getBaseOption() {
      try {
        this.baseOptions =
          require(`@/assets/echart-templates/${this.graphData.id}.js`).default;
      } catch {
        this.baseOptions =
          require("@/assets/echart-templates/default.js").default;
      }
    },
    renderChart(option) {
      const chartDom = this.$refs.chartContainer;
      if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
        const myChart = echarts.init(chartDom);
        myChart.setOption(option);
      }
    },
  },
};
</script>
<style></style>
