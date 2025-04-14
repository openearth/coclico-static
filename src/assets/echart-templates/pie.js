export const pieChartTemplate = ({
  values,
  colorPalette = ["#307fb6", "#5e9dc4", "#abcfe5"],
}) => {
  return {
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: "70%",
        top: 30,
        data: values,
        color: colorPalette,
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
};
