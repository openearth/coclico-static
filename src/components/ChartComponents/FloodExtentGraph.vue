<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>

<script>
import { nextTick } from "vue";
import * as echarts from "echarts";

export default {
  data() {
    return {
      colorPalette: ["#307fb6", "#5e9dc4", "#abcfe5"],
    };
  },
  methods: {
    renderChart() {
      const chartDom = this.$refs.chartContainer;
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
              data: [
                { value: 2, name: "% flood > 0.5m" },
                { value: 4, name: "% flood < 0.5m" },
                { value: 96, name: "% not flooded" },
              ],
              color: this.colorPalette,
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
    },
  },
  mounted() {
    nextTick(() => {
      this.renderChart();
    });
    window.addEventListener("resize", this.renderChart);
  },
};
</script>

<style></style>
