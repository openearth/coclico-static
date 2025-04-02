import getFeatureInfo from "@/lib/geoserver_utils/get-feature-info";

const chunkArray = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];

/**
 * Function that fetches the data for raster maps at a given location
 * @param dataset
 * @param layerName {String | null}
 * @param lng {Number}
 * @param lat {Number}
 * @param props
 * @param keys {String[]}
 * @param propertyName {String[]}
 * @returns {Promise<*>}
 */
export async function getRasterMapGraphData({
  dataset,
  layerName,
  coords: { lng, lat },
  props,
  keys,
  propertyName,
}) {
  const defenseLevel = props.find((prop) => prop.id === "defense level").value;
  const rp = props.find((prop) => prop.id === "return period").value;
  const times = props.find((prop) => prop.id === "time").values.sort();
  const scenarios = props.find((prop) => prop.id === "scenarios").values;
  const layers = scenarios.flatMap((scenario) =>
    times.flatMap((time) => ({
      rp,
      defenseLevel,
      scenario,
      time,
      name: `${layerName}_${defenseLevel}_${rp}_${scenario}_${time}`,
    })),
  );
  return getFeatureInfo({
    layers,
    layer: layerName,
    url: `https://coclico.avi.deltares.nl/geoserver/${dataset.id}/wms`,
    lng,
    lat,
    x: 1,
    y: 1,
    keys,
    propertyName,
  });
}
