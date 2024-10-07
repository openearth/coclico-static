export default ({ id, assets, tileSize = 256 }) => {
  const { visual } = assets;
  return {
    id,
    type: "raster",
    source: {
      type: "raster",
      tiles: [visual.href],
      tileSize,
    },
  };
};
