//TODO: fix it after DEMO
export default function (layer, properties) {
  let combination = layer.source.tiles[0];

  combination = combination.split("cfhp:")[1];

  const graphData = Object.fromEntries(
    Object.entries(properties).filter(([key]) => key.includes(combination))
  );

  return graphData;
}
