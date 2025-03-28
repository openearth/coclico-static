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
    top: "20%",
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
      start: 50,
      end: 100,
    },
  ],
  legend: {
    show: true,
  },
  textStyle: {
    fontFamily: "Helvetica",
  },
  yAxis: {
    min: (value) => value.min - 0.1,
    axisLabel: {
      formatter: (value) => `${parseInt(value * 100)}%`,
    },
    nameTextStyle: {
      color: "black",
      fontFamily: "Helvetica",
    },
    name: "Exposed %",
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
