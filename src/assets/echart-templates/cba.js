export default {
  tooltip: {
    trigger: "item",
  },
  grid: {
    top: "10%",
    left: "0%",
    right: "0%",
    bottom: "5%",
    containLabel: true,
  },
  textStyle: {
    fontFamily: "Helvetica",
  },
  dataZoom: [
    {
      type: "inside",
      yAxisIndex: [0],
    },
  ],
  series: [
    {
      type: "pie",
      radius: "70%",
      top: 30,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
  ],
};
