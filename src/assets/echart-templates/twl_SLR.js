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
    valueFormatter: (value) => `${value.toFixed(2)} m`,
  },
  legend: {
    top: "horizontal",
  },
  grid: {
    show: true,
    top: "10%",
    left: "6%",
    right: "5%",
    bottom: "10%",
    containLabel: true,
  },
  dataZoom: [
    {
      type: "inside",
      realtime: true,
      yAxisIndex: [0],
    },
  ],
  textStyle: {
    fontFamily: "Helvetica",
  },
  xAxis: {
    splitLine: {
      show: true,
    },
    axisLabel: {
      fontSize: 14,
    },
    axisLine: {
      lineStyle: { color: "#000000" },
    },
    nameLocation: "center",
    nameGap: 30,
    nameTextStyle: {
      color: "black",
      fontSize: 14,
      fontFamily: "Helvetica",
    },
    name: "Year",
  },
  yAxis: {
    type: "value",
    min: (value) => Math.max(value.min - 0.2, 0),
    max: (value) => value.max + 0.2,
    axisLabel: {
      fontSize: 14,
      formatter: (value) => `${parseFloat(value).toFixed(1)} m`,
    },
    nameLocation: "middle",
    nameGap: 50,
    nameTextStyle: {
      color: "black",
      fontSize: 14,
      fontFamily: "Helvetica",
    },
    name: "Extreme surge level [m]",
  },
};
