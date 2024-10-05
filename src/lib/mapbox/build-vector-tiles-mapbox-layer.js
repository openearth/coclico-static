export default (tiles) => {
  // extract id from tiles
  const layer = tiles.match(/LAYER=([^&]*)/);
  let id = layer ? layer[1] : null;

  id = id.split(":")[1];

  return {
    id,
    type: "fill",
    source: {
      type: "vector",
      tiles: [tiles],
      minZoom: 6,
      maxZoom: 20,
    },
    "source-layer": id,
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": 0,
    },
  };
};
