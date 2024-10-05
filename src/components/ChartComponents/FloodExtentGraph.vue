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
  data() {
    return {
      colorPalette: ["#307fb6", "#5e9dc4", "#abcfe5"],
      formattedGraphData: [],
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
              data: this.formattedGraphData,
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
    formatGraphData() {
      let total = null;

      // First, find the total in the graphData
      for (const key in this.graphData) {
        if (key.includes("total")) {
          total = this.graphData[key];
          break; // Exit the loop once total is found
        }
      }

      // If total is not found, handle the error or return early
      if (total === null) {
        console.error("Total value not found in graphData");
        return;
      }

      // Now proceed with the rest of the graphData processing
      for (const key in this.graphData) {
        if (key.includes("more05")) {
          const value = (this.graphData[key] / total) * 100;
          this.formattedGraphData.push({
            value: parseFloat(value.toFixed(2)),
            name: "% flood > 0.5m",
          });
        } else if (key.includes("less05")) {
          const value = (this.graphData[key] / total) * 100;
          this.formattedGraphData.push({
            value: parseFloat(value.toFixed(2)),
            name: "% flood < 0.5m",
          });
        } else if (key.includes("nans")) {
          const value = (this.graphData[key] / total) * 100;
          this.formattedGraphData.push({
            value: parseFloat(value.toFixed(2)),
            name: "% not flooded",
          });
        }
      }
    },
  },
  mounted() {
    this.formatGraphData();
    nextTick(() => {
      this.renderChart();
    });
    window.addEventListener("resize", this.renderChart);
  },
};
</script>

<style></style>
