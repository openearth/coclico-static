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
  const preferredOrder = ["ssp126", "ssp245", "ssp585", "high_end"];
  scenarios.sort((a, b) => preferredOrder.indexOf(a) - preferredOrder.indexOf(b));
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
  const scenarioColors = {
    ssp126: "#173c66",
    ssp245: "#f79320",
    ssp585: "#951b1e",
    high_end: "#000000",
  };

  const ensembleByName = {
    Low: "msl_l",
    Medium: "msl_m",
    High: "msl_h",
  };

  return scenarios.map((scenario) => {
    // For each time step, find low/medium/high
    const timeValues = time.map((t) => {
      const low = data.find(
        (d) => d.scenario === scenario && d.ensemble === "msl_l" && d.time === t
      )?.value;

      const high = data.find(
        (d) => d.scenario === scenario && d.ensemble === "msl_h" && d.time === t
      )?.value;

      return high != null && low != null ? high - low : null;
    });

    const baseValues = time.map((t) =>
      data.find(
        (d) => d.scenario === scenario && d.ensemble === "msl_l" && d.time === t
      )?.value ?? 0
    );

    return {
      name: scenario === "high_end" ? "High End" : scenario.toUpperCase(),
      type: "bar",
      stack: scenario,
      barGap: 0,
      itemStyle: {
        borderWidth: 0.2,
        borderColor: "#FFFFFF",
      },
      barCategoryGap: "50%",
      barWidth: 5,
      data: timeValues,
      color: scenarioColors[scenario],
      // 👇 This moves the bar up to start at the low value
      encode: {
        y: 1,
      },
      // 👇 This applies the low values as a base
      base: baseValues,
    };
  });
}
