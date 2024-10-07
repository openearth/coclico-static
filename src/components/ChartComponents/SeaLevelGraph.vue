<template>
  <div ref="chartContainer" style="width: 100%; height: 100%"></div>
</template>

<script>
import { nextTick } from "vue";
import * as echarts from "echarts";

export default {
  props: {
    seaLevelRiseData: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      colors: ["#000000", "#173c66", "#f79320", "#951b1e"], // Standard colors
    };
  },
  methods: {
    generateSeries() {
      const series = [];

      // Loop through each scenario in the data and generate the series
      this.seaLevelRiseData.scenarios.forEach((scenario, index) => {
        const color = this.colors[index % this.colors.length]; // Use standard colors in a cycle

        // Add low data as a transparent placeholder (baseline)
        series.push({
          name: `Low ${scenario.name}`,
          type: "bar",
          stack: scenario.name,
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
          data: scenario.msl_l.values,
          animation: false,
          silent: true,
          barWidth: 3,
        });

        // Add medium sea level rise data
        series.push({
          name: `Medium ${scenario.name}`,
          type: "bar",
          stack: scenario.name,
          color: color, // Use one of the standard colors
          itemStyle: {
            borderWidth: 0.2,
            borderColor: "#000000",
          },
          data: scenario.msl_m.values,
          animation: false,
          silent: true,
          barWidth: 3,
        });

        // Add high sea level rise data (top)
        series.push({
          name: `High ${scenario.name}`,
          type: "bar",
          stack: scenario.name,
          color: color, // Use the same color as medium
          itemStyle: {
            borderWidth: 0.2,
            borderColor: "#000000",
          },
          data: scenario.msl_h.values,
          animation: false,
          silent: true,
          barWidth: 3,
        });
      });
      // Move the first three items to the end
      // TODO: Etienne should provide them in the right order instead
      const firstThreeItems = series.splice(0, 3);
      series.push(...firstThreeItems);
      return series;
    },
    renderChart() {
      const chartDom = this.$refs.chartContainer;
      if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
        const myChart = echarts.init(chartDom);

        const option = {
          title: {
            text: "Sea Level Rise",
            left: "center",
          },
          xAxis: {
            type: "category",
            data: this.seaLevelRiseData.time, // Use time for x-axis
            name: "Year",
            nameLocation: "middle",
            nameGap: 25,
          },
          yAxis: {
            type: "value",
            name: "Sea level rise [m]",
            nameLocation: "middle",
            nameGap: 30,
          },
          tooltip: {
            trigger: "axis",
            confine: false,
            formatter: function (params) {
              const formatValue = (value) => parseFloat(value).toFixed(2);
              let tooltip = params[0].axisValue.bold() + "<br/>";
              params.forEach((param) => {
                tooltip += `${param.seriesName} : ${formatValue(
                  param.value
                )} m<br/>`;
              });
              return tooltip;
            },
          },
          legend: {
            data: this.seaLevelRiseData.scenarios.map(
              (scenario) => `${scenario.name}`
            ),
            selectedMode: false,
            orient: "horizontal",
            bottom: 0,
            itemStyle: {
              borderWidth: 0.5,
            },
          },
          grid: {
            top: "15%",
            left: "5%",
            right: "5%",
            bottom: "15%",
            containLabel: true,
          },
          series: this.generateSeries(),
        };

        myChart.setOption(option);
      }
    },
  },
  mounted() {
    if (this.seaLevelRiseData && this.seaLevelRiseData.time) {
      nextTick(() => {
        this.renderChart();
      });
      window.addEventListener("resize", this.renderChart);
    } else {
      console.error("No valid sea level rise data provided.");
    }
  },
};
</script>

<style></style>
