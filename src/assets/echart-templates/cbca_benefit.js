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
    valueFormatter: (value) => `${value.toFixed(2)} `,
  },
  legend: {
    top: "horizontal",
  },
  grid: {
    show: true,
    top: 30,
    bottom: 50,
    right: 20,
    left: 60,
  },
  dataZoom: [
    {
      type: "inside",
      realtime: true,
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
    nameLocation: "center",
    nameGap: 30,
    nameTextStyle: {
      color: "black",
      fontSize: 14,
      fontFamily: "Helvetica",
    },
    name: "Scenario [-]",
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 500,
    axisLabel: {
      fontSize: 14,
    },
    nameLocation: "center",
    nameGap: 45,
    nameTextStyle: {
      color: "black",
      fontSize: 14,
      fontFamily: "Helvetica",
    },
    name: "Benefit [M€]",
  },
};
