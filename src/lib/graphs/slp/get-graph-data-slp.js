import getFeatureInfo from "@/lib/geoserver_utils/get-feature-info";

const chunkArray = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];

const getEnsembleLabel = (ensemble) =>
  ({
    msl_l: "Low",
    msl_m: "Medium",
    msl_h: "High",
  })[ensemble];

/**
 * Function that fetches the data for the sea level rise graph
 * @param dataset
 * @param lng
 * @param lat
 * @param props
 * @returns {Promise<*>}
 */
export async function getSlpGraphData(dataset, { lng, lat }, props) {
  const scenarios = props.find((prop) => prop.id === "scenarios").values;
  const time = props.find((prop) => prop.id === "time").values;
  const ensemble = props.find((prop) => prop.id === "ensemble").values;
  const layerChunks = chunkArray(
    scenarios.flatMap((scenario) =>
      ensemble.flatMap((ensemble) =>
        time.flatMap((time) => ({
          scenario,
          ensemble,
          time,
          name: `${scenario}_${ensemble}_${time}`,
        })),
      ),
    ),
    10,
  );
  const data = (
    await Promise.all(
      layerChunks.map(
        async (layers) =>
          (
            await getFeatureInfo({
              layers,
              url: "https://coclico.avi.deltares.nl/geoserver/slp/wms",
              lng,
              lat,
            }).then((features) => ({
              data: layers.flatMap((layer, index) => {
                return {
                  ...layer,
                  value: features[index].properties["GRAY_INDEX"],
                };
              }),
            }))
          )?.data,
      ),
    )
  ).flat();
  const colors = ["#000000", "#173c66", "#f79320", "#951b1e"];
  return scenarios.flatMap((scenario, index) =>
    ensemble.map((ensemble) => ({
      name: `${getEnsembleLabel(ensemble)} ${scenario}`,
      type: "bar",
      stack: scenario,
      color: colors[index % colors.length],
      itemStyle:
        {
          borderWidth: 0.2,
          borderColor: "#FFFFFF",
        },
      data: data
        .filter(
          (datum) => datum.scenario === scenario && datum.ensemble === ensemble,
        )
        .sort((a, b) => a.time - b.time)
        .map(({ value }) => value),
      animation: false,
      silent: true,
      showInLegend: getEnsembleLabel(ensemble) === "High"
    })),
  );
}
