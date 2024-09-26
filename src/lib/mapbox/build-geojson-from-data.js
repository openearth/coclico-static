export default (data) => {
  return {
    id: "parquet",
    type: "fill",
    source: {
      type: "geojson",
      data,
    },
    paint: {
      "fill-color": "rgba(255, 255, 255, 0)",
      "fill-outline-color": "rgba(0, 0, 0, 0.3)",
    },
  };
};
