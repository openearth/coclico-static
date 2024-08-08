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
  methods: {
    renderChart() {
      const chartDom = this.$refs.chartContainer;
      if (chartDom && chartDom.clientWidth && chartDom.clientHeight) {
        const myChart = echarts.init(chartDom);
        const option = {
          title: {
            text: "Sea Level Rise",
            left: "center",
          },
          tooltip: {
            trigger: "axis",
            confine: true,
            formatter: function (params) {
              var varsSsp3Low = params[0];
              var varsSsp3Med = params[1];
              var varsSsp3High = params[2];
              var varsSsp4Low = params[3];
              var varsSsp4Med = params[4];
              var varsSsp4High = params[5];
              var varsSsp6Low = params[6];
              var varsSsp6Med = params[7];
              var varsSsp6High = params[8];
              const formatValue = (value) => parseFloat(value).toFixed(2);
              return (
                varsSsp3Med.name.bold() +
                "<br/>" +
                varsSsp3Med.seriesName +
                " [m] : " +
                formatValue(varsSsp3Low.value) +
                " - " +
                formatValue(varsSsp3Low.value + varsSsp3Med.value) +
                " - " +
                formatValue(
                  varsSsp3Low.value + varsSsp3Med.value + varsSsp3High.value
                ) +
                "<br/>" +
                varsSsp4Med.seriesName +
                " [m] : " +
                formatValue(varsSsp4Low.value) +
                " - " +
                formatValue(varsSsp4Low.value + varsSsp4Med.value) +
                " - " +
                formatValue(
                  varsSsp4Low.value + varsSsp4Med.value + varsSsp4High.value
                ) +
                "<br/>" +
                varsSsp6Med.seriesName +
                " [m] : " +
                formatValue(varsSsp6Low.value) +
                " - " +
                formatValue(varsSsp6Low.value + varsSsp6Med.value) +
                " - " +
                formatValue(
                  varsSsp6Low.value + varsSsp6Med.value + varsSsp6High.value
                )
              );
            },
          },
          legend: {
            data: ["SSP3", "SSP4", "SSP5"],
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
            right: "0%",
            bottom: "15%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            splitLine: { show: false },
            data: this.seaLevelRiseData.xAxisData,
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
              data: this.seaLevelRiseData.ssp3LowData,
              animation: false,
              silent: true,
              barWidth: 10,
            },
            {
              name: "SSP3",
              type: "bar",
              stack: "SSP3",
              color: "#173c66",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: this.seaLevelRiseData.ssp3MedData,
              animation: false,
              silent: true,
              barWidth: 10,
            },
            {
              name: "Sea Level Rise top SSP3",
              type: "bar",
              stack: "SSP3",
              color: "#173c66",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: this.seaLevelRiseData.ssp3HighData,
              animation: false,
              silent: true,
              barWidth: 10,
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
              data: this.seaLevelRiseData.ssp4LowData,
              animation: false,
              silent: true,
              barWidth: 10,
            },
            {
              name: "SSP4",
              type: "bar",
              stack: "SSP4",
              color: "#f79320",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: this.seaLevelRiseData.ssp4MedData,
              animation: false,
              silent: true,
              barWidth: 10,
            },
            {
              name: "Sea Level Rise top SSP4",
              type: "bar",
              stack: "SSP4",
              color: "#f79320",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: this.seaLevelRiseData.ssp4HighData,
              animation: false,
              silent: true,
              barWidth: 10,
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
              data: this.seaLevelRiseData.ssp5LowData,
              animation: false,
              silent: true,
              barWidth: 10,
            },
            {
              name: "SSP5",
              type: "bar",
              stack: "SSP5",
              color: "#e71d24",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: this.seaLevelRiseData.ssp5MedData,
              animation: false,
              silent: true,
              barWidth: 10,
            },
            {
              name: "Sea Level Rise top SSP5",
              type: "bar",
              stack: "SSP5",
              color: "#e71d24",
              itemStyle: {
                borderWidth: 0.5,
                borderColor: "#000000",
              },
              data: this.seaLevelRiseData.ssp5HighData,
              animation: false,
              silent: true,
              barWidth: 10,
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
