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
  legend: {
    top: "horizontal",
  },
  grid: {
    show: true,
    top: 30,
    bottom: 50,
    right: 20,
    left: 50,
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
    nameGap: 20,
    name: "-",
    nameTextStyle: {
      color: "black",
      fontSize: 14,
      fontFamily: "Helvetica",
    },
  },
  yAxis: {
    type: "value",
    axisLabel: {
      fontSize: 14,
    },
    nameLocation: "center",
    name: "-",
    nameGap: 30,
    nameTextStyle: {
      color: "black",
      fontSize: 14,
      fontFamily: "Helvetica",
    },
  },
};
