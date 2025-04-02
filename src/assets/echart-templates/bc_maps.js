export default {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    backgroundColor: "rgba(50,50,50,0.7)",
    textStyle: {
      color: "#fff",
    },
  },
  grid: {
    top: "10%",
    left: "5%",
    right: "5%",
    bottom: "10%",
    containLabel: true,
    show: true,
  },
  dataZoom: [
    {
      type: "inside",
      yAxisIndex: [0],
    },
  ],
  legend: {
    show: true,
    formatter: (value) => value.replace(" total", ""),
  },
  textStyle: {
    fontFamily: "Helvetica",
  },
  yAxis: {
    min: (value) => value.min - 100,
    max: (value) => value.max + 100,
    axisLabel: {
      formatter: (value) => `€${parseInt(value)}`,
    },
    nameTextStyle: {
      color: "black",
      fontFamily: "Helvetica",
    },
    name: "Costs (€)",
    nameLocation: "center",
    nameGap: 50,
  },
  xAxis: {
    splitLine: {
      show: true,
    },
    showGrid: true,
    nameLocation: "center",
    nameTextStyle: {
      color: "black",
      fontFamily: "Helvetica",
    },
    name: "Year",
    title: "Year",
  },
};
