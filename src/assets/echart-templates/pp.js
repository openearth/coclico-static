export default {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
    backgroundColor: "rgba(50,50,50,0.7)",
    textStyle: {
      color: "#fff",
    },
    valueFormatter: (value) => `${value.toFixed(2)} m`,
  },
  legend: {
    show: true,
  },
  textStyle: {
    fontFamily: "Helvetica",
  },
  xAxis: {
    axisLine: {
      lineStyle: { color: "#000000", lineStyle: "solid", width: 1 },
      show: true,
    },
    nameLocation: "center",
    nameTextStyle: {
      color: "black",
      fontFamily: "Helvetica",
    },
    name: "Year",
  },
};
