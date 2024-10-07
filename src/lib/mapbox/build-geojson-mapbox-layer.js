export default ({ id, properties, assets }) => {
  const { mapbox } = assets;
  return {
    id,
    type: properties["deltares:type"],
    source: {
      type: mapbox.type,
      url: mapbox.href,
    },
    "source-layer": mapbox.source,
    paint: properties["deltares:paint"],
  };
};
