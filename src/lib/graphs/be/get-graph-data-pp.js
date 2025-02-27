import getFeatureInfo from "@/lib/geoserver_utils/get-feature-info";

const chunkArray = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
/**
 * Function that fetches the data for the sea level rise graph
 * @param dataset
 * @param lng
 * @param lat
 * @param props
 * @returns {Promise<*>}
 */
export async function getBeGraphData(dataset, { lng, lat }, props) {
  const defenseLevel = props.find((prop) => prop.id === "defense level").value;
  const rp = props.find((prop) => prop.id === "return period").value;
  const times = props.find((prop) => prop.id === "time").values.sort();
  const scenarios = props.find((prop) => prop.id === "scenarios").values;
  const layerChunks = chunkArray(
    scenarios.flatMap((scenario) =>
      times.flatMap((time) => ({
        rp,
        defenseLevel,
        scenario,
        time,
        name: `pop_stats_${defenseLevel}_${rp}_${scenario}_${time}`,
      })),
    ),
    100,
  );
  return (
    await Promise.all(
      layerChunks.map((layers) =>
        getFeatureInfo({
          layers,
          url: "https://coclico.avi.deltares.nl/geoserver/be_maps/wms",
          lng,
          lat,
          keys: ["rel_affected", "abs_affected"],
        }),
      ),
    )
  ).flat();
}
