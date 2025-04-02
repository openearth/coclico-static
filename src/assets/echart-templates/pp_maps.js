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
    formatter: (value) => value.replace(" rel_affected", ""),
  },
  textStyle: {
    fontFamily: "Helvetica",
  },
  yAxis: {
    min: (value) => Math.max(0, value.min - 0.005),
    max: (value) => Math.min(1, value.max + 0.005),
    axisLabel: {
      formatter: (value) => `${parseFloat(value * 100).toFixed(1)}%`,
    },
    nameTextStyle: {
      color: "black",
      fontFamily: "Helvetica",
    },
    name: "Exposed (%)",
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
