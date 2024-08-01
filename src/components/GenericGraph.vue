<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>

<script>
import { nextTick } from "vue";
import * as echarts from "echarts";

export default {
  methods: {
    renderChart() {
      const chartDom = this.$refs.chartContainer;
      if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
        const myChart = echarts.init(chartDom);
        const option = {
          title: {
            text: "Sea Level Rise",
            top: "20px",
            left: "90px",
          },
          tooltip: {
            trigger: "axis",
            formatter: function (params) {
              var tar0 = params[0];
              var tar1 = params[1];
              var tar2 = params[2];
              return (
                tar1.name +
                "<br/>" +
                tar1.seriesName +
                " [m] : " +
                tar0.value +
                " - " +
                (tar0.value + tar1.value) +
                " - " +
                (tar0.value + tar1.value + tar2.value)
              );
            },
          },
          legend: {
            data: [
              "Sea Level Rise SSP3",
              "Sea Level Rise SSP4",
              "Sea Level Rise SSP5",
            ],
            selectedMode: false,
            orient: "vertical",
            left: "right",
          },
          grid: {
            top: "25%",
            left: "3%",
            right: "4%",
            bottom: "0%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            splitLine: { show: false },
            data: ["2010", "2020", "2030", "2040", "2050", "2060"],
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              name: "Placeholder SSP3",
              type: "bar",
              stack: "SSP3",
              itemStyle: {
                borderColor: "transparent",
                color: "transparent",
              },
              emphasis: {
                itemStyle: {
                  borderColor: "transparent",
                  color: "transparent",
                },
              },
              data: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
              animation: false,
            },
            {
              name: "Sea Level Rise SSP3",
              type: "bar",
              stack: "SSP3",
              color: "#5470c6",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65],
              animation: false,
            },
            {
              name: "Sea Level Rise top SSP3",
              type: "bar",
              stack: "SSP3",
              color: "#5470c6",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: [0.15, 0.25, 0.35, 0.45, 0.55, 0.65],
              animation: false,
            },
            {
              name: "Placeholder SSP4",
              type: "bar",
              stack: "SSP4",
              itemStyle: {
                borderColor: "transparent",
                color: "transparent",
              },
              emphasis: {
                itemStyle: {
                  borderColor: "transparent",
                  color: "transparent",
                },
              },
              data: [0.25, 0.35, 0.5, 0.6, 0.75, 0.9],
              animation: false,
            },
            {
              name: "Sea Level Rise SSP4",
              type: "bar",
              stack: "SSP4",
              color: "#d6263d",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: [0.2, 0.3, 0.4, 0.55, 0.7, 0.8],
              animation: false,
            },
            {
              name: "Sea Level Rise top SSP4",
              type: "bar",
              stack: "SSP4",
              color: "#d6263d",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: [0.2, 0.3, 0.4, 0.55, 0.7, 0.8],
              animation: false,
            },
            {
              name: "Placeholder SSP5",
              type: "bar",
              stack: "SSP5",
              itemStyle: {
                borderColor: "transparent",
                color: "transparent",
              },
              emphasis: {
                itemStyle: {
                  borderColor: "transparent",
                  color: "transparent",
                },
              },
              data: [0.3, 0.45, 0.55, 0.75, 0.9, 1],
              animation: false,
            },
            {
              name: "Sea Level Rise SSP5",
              type: "bar",
              stack: "SSP5",
              color: "#26d65f",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: [0.25, 0.355, 0.5, 0.65, 0.8, 0.95],
              animation: false,
            },
            {
              name: "Sea Level Rise top SSP5",
              type: "bar",
              stack: "SSP5",
              color: "#26d65f",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: [0.25, 0.355, 0.5, 0.65, 0.8, 0.95],
              animation: false,
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
