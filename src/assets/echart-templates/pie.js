const typeOptions = (datasetId) => {
  switch (datasetId) {
    case "cfhp":
      return {
        title: {
          text: "Coastal Flood Hazard Probability",
          left: "center",
        },
      };
    case "cba":
      return {
        title: {
          text: "Cost Benefit Analysis",
          left: "center",
        },
      };
    default:
      return {
        title: {
          text: datasetId,
          left: "center",
        },
      };
  }
};

export const pieChartTemplate = ({
  datasetId,
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
    ...typeOptions(datasetId),
  };
};
