export default {
  xAxis: {
    type: "category",
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
        tooltip += `${param.seriesName} : ${formatValue(param.value)} m<br/>`;
      });
      return tooltip;
    },
  },
  legend: {
    selectedMode: false,
  },
  grid: {
    top: "10%",
    left: "10%",
    right: "5%",
    bottom: "15%",
    containLabel: true,
  },
};
