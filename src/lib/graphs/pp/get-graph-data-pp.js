import getFeatureInfo from "@/lib/geoserver_utils/get-feature-info";

/**
 * Function that fetches the data for the sea level rise graph
 * @param dataset
 * @param lng
 * @param lat
 * @param props
 * @returns {Promise<*>}
 */
export async function getPpGraphData(dataset, { lng, lat }, props) {
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
      name: `pop_stats_${defenseLevel}_${rp}_${scenario}_${time}`,
    })),
  );
  return await getFeatureInfo({
    layers,
    layer: "pop_stats",
    url: "https://coclico.avi.deltares.nl/geoserver/pp_maps/wms",
    lng,
    lat,
    x: 1,
    y: 1,
    keys: ["rel_affected", "abs_affected"],
  });
}
