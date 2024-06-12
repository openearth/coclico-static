export default ({ id, assets, tileSize = 256 }) => {
  console.log("id", id, assets);
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
