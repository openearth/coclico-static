import { get, unzip } from "lodash-es";
import { openArray } from "zarr";
import { getSlpGraphData } from "@/lib/graphs/slp/get-graph-data-slp";
import { getRasterMapGraphData } from "@/lib/graphs/raster-maps-data";

export const GRAPH_TYPES = {
  FLOOD_EXTEND: "flood-extend-graph",
  LINE_CHART: "line-chart",
  SEA_LEVEL_RISE: "sea-level-rise",
  PIE_CHART: "pie-chart",
};

/**
 * Graph type mask
 * @type {{cfhp: string, eesl: string, sc: string, slp: string, ssl: string, cba: string}}
 */
const GRAPH_TYPE_MASK = {
  cfhp: GRAPH_TYPES.PIE_CHART,
  eesl: GRAPH_TYPES.LINE_CHART,
  sc: GRAPH_TYPES.LINE_CHART,
  slp: GRAPH_TYPES.SEA_LEVEL_RISE,
  ssl: GRAPH_TYPES.LINE_CHART,
  cba: GRAPH_TYPES.PIE_CHART,
  pp_maps: GRAPH_TYPES.LINE_CHART,
  be_maps: GRAPH_TYPES.LINE_CHART,
};

/**
 * Get graph type
 * @param id
 * @returns {*|string}
 */
export const getGraphType = (id) =>
  GRAPH_TYPE_MASK?.[id] || GRAPH_TYPES.LINE_CHART;

/**
 * Get graph feature data for a dataset with a WMTS geoserver_link
 * @param datasetId
 * @param feature
 * @param properties
 * @param values
 * @returns {{id, name, xAxis: {data: *, title: string}, yAxis: {type: string, min: number, alignTicks, max: number, interval: number, axisLabel: {formatter: function(*): string}, nameTextStyle: {color: string, fontFamily: string}, name: string, nameLocation: string}[], series: *}|{name: *, value: *}[]|{name: string, value: *}[]|[string, unknown][]}
 */
export function getFeatureData({ datasetId, feature, values }) {
  switch (datasetId) {
    case "cba": {
      return Object.entries(feature)
        .filter(
          ([key]) =>
            key.toLowerCase().includes(values.time.toLowerCase()) &&
            key.toLowerCase().includes(values.scenarios.toLowerCase()),
        )
        .map(([name, value]) => {
          return {
            name: name.split("\\")[0],
            value,
          };
        });
    }
    case "cfhp": {
      const scenarios =
        values.scenarios !== "none"
          ? values.scenarios.toLowerCase()
          : "mean_spring_tide";
      const time = values?.time.toLowerCase() || "";
      const defenseLevel = values?.["defense level"].toLowerCase() || "";
      return Object.entries(feature)
        .filter(([_key]) => {
          const key = _key.toLowerCase();
          return (
            key.includes(time) &&
            key.includes(scenarios) &&
            key.includes(defenseLevel) &&
            !key.includes("flooded")
          );
        })
        .map(([_key, value]) => {
          const key = _key.toLowerCase();
          const name = key.includes("more05")
            ? "% flood > 0.5m"
            : key.includes("less05")
              ? "% flood < 0.5m"
              : key.includes("nans")
                ? "% not flooded"
                : key;

          return {
            name,
            value,
          };
        });
    }
    default:
      return Object.entries(feature).filter(([key]) => key.includes(datasetId));
  }
}

/**
 * Get data for a raster based dataset and location
 * @param dataset
 * @param coords
 * @param props
 * @returns {Promise<*|null>}
 */
export async function getRasterData(dataset, coords, props) {
  const { id } = dataset;
  switch (id) {
    case "slp":
      try {
        return {
          values: await getSlpGraphData(dataset, coords, props),
          time: props.find(({ id }) => id === "time").values.sort(),
          scenarios: props.find(({ id }) => id === "scenarios").values,
        };
      } catch (error) {
        console.error("Error while fetching data from getGraphDataSlp:", error);
        throw error;
      }
    case "pp_maps":
      return exposed({
        dataset,
        coords,
        props,
        layerName: "pop_stats",
        keys: ["rel_affected", "abs_affected"],
        unit: "percentage",
      });
    case "be_maps":
      return exposed({
        dataset,
        coords,
        props,
        layerName: "be_stats",
        keys: ["rel_affected", "abs_affected"],
        unit: "percentage",
      });
    case "bc_maps":
      return exposed({
        dataset,
        coords,
        props,
        layerName: "bc_stats",
        keys: ["total"],
        unit: "euro",
      });
    default:
      console.warn(`No handler for dataset id: ${id}`);
      return null;
  }
}
const unitFormatter = (unit, value) =>
  unit === "percentage"
    ? `${(parseFloat(value) * 100).toFixed(2)}%`
    : unit === "euro"
      ? `€${parseFloat(value).toFixed(0)}`
      : parseFloat(value).toFixed(2);

async function exposed({ dataset, coords, props, layerName, keys, unit }) {
  try {
    const { id } = dataset;
    const data = await getRasterMapGraphData({
      dataset,
      coords,
      props,
      layerName,
      keys,
    });
    const scenarios = props.find(({ id }) => id === "scenarios").values;
    return {
      id,
      name: id,
      series: scenarios.flatMap((scenario) =>
        keys.flatMap((key) => ({
          name: `${scenario} ${key}`,
          type: "line",
          key,
          tooltip: {
            valueFormatter: (value) => unitFormatter(unit, value),
            formatter: (value) => unitFormatter(unit, value),
          },
          data: data
            .filter(
              (datum) =>
                datum.scenario === scenario &&
                datum.defenseLevel ===
                  props.find((prop) => prop.id === "defense level").value &&
                datum.rp ===
                  props.find((prop) => prop.id === "return period").value,
            )
            .sort((a, b) => a.time - b.time)
            .map(({ value }) => {
              return value?.[key] || value;
            }),
        })),
      ),
    };
  } catch (error) {
    console.error("Error while fetching data from getGraphDataPp:", error);
    throw error;
  }
}

/**
 * Fetch Zarr data
 * @param url
 * @param path
 * @param slice
 * @returns {Promise<NestedArray<TypedArray>|number>}
 */
async function fetchZarrData(url, path, slice) {
  try {
    const res = await openArray({ store: url, path, mode: "r" });
    const data = await res.get(slice);
    if (data.data.length > data.data[0].length) {
      data.data = unzip(data.data);
    }
    return data;
  } catch (error) {
    console.error("Error fetching Zarr data:", error);
    throw error;
  }
}

/**
 * Get Zarr data
 * @param dataset
 * @param features
 * @param props
 * @returns {Promise<{id: *, name: *, series: *, xAxis: {type: string, data, title: string}, yAxis: {title: string}}>}
 */
export async function getZarrData(dataset, features, props) {
  const url = dataset?.assets?.data?.href;
  const datasetName = dataset?.id;
  const variables = Object.entries(get(dataset, "cube:variables"));
  const path = variables
    .filter((dim) => dim[1].type === "data")
    .map((dim) => dim[0]);
  const dimensions = Object.entries(
    get(dataset, `["cube:variables"].${path[0]}.dimensions`),
  );
  const summaryList = get(dataset, "summaries");

  const slice = dimensions.map((dim) => {
    if (dim[1] === "stations") return get(features, "properties.locationId", 0);
    if (
      dim[1] === "nscenarios" &&
      get(dataset, "deltares:plotSeries") !== "scenarios"
    ) {
      return summaryList
        .find((object) => object.id === "scenarios")
        .values.findIndex((scenario) => scenario === props.scenarios);
    }
    if (
      dim[1] === "rp" &&
      get(dataset, "deltares:plotSeries") !== "scenarios"
    ) {
      return summaryList
        .find((object) => object.id === "rp")
        .values.findIndex((object) => object === props.rp);
    }
    return null;
  });

  const data = await fetchZarrData(url, path[0], slice);
  const series = data.data.map((serie) => ({
    type: "line",
    data: Array.from(serie),
  }));

  const variableUnit = Object.entries(
    get(dataset, `["cube:variables"].${path[0]}.unit`),
  );
  const cubeDimensions = get(dataset, "cube:dimensions");
  const xAxis = get(dataset, "deltares:plotxAxis");
  const plotSeries = get(dataset, "deltares:plotSeries");

  const dimensionNames = Object.entries(
    get(dataset, `cube:dimensions.${plotSeries}.values`),
  );
  for (let i = 0; i < series.length; i++) {
    if (dimensionNames.length === series.length) {
      series[i].name =
        typeof dimensionNames[i][1] === "number"
          ? String(dimensionNames[i][1])
          : dimensionNames[i][1];
    } else {
      summaryList.map((summary) => {
        if (summary.id === plotSeries || summary.id === "rp") {
          series[i].name = `${summary.id} ${String(summary.allowedValues[i])}`;
        }
      });
    }
  }

  return {
    id: datasetName,
    name: datasetName,
    series,
    xAxis: {
      type: "category",
      data: cubeDimensions[xAxis].values,
      title: `${xAxis}`,
    },
    yAxis: {
      title: `${variableUnit[0][1]}`,
    },
  };
}

export function getGraphTypeData({
  datasetId,
  feature,
  values,
  properties,
  coords,
  graphType,
}) {
  const graphValues = getFeatureData({
    datasetId,
    feature,
    values,
    properties,
  });
  if (graphType === GRAPH_TYPES.LINE_CHART) {
    return {
      ...graphValues,
      values: graphValues?.series,
      datasetId,
      graphType: GRAPH_TYPES.LINE_CHART,
      coords,
    };
  } else {
    const totalInSet = graphValues?.find?.(
      ({ name }) =>
        name.toLowerCase().includes("total") ||
        name.toLowerCase().includes("tot"),
    );
    const _values = totalInSet
      ? graphValues.filter(({ name }) => name !== totalInSet.name)
      : graphValues;
    const total =
      totalInSet ||
      Math.ceil(values?.reduce?.((acc, cur) => acc + cur.value, 0));
    return {
      total,
      values: _values,
      datasetId,
      graphType,
      coords,
    };
  }
}
