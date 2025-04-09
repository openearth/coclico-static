import { get, unzip } from "lodash-es";
import { openArray } from "zarr";
import { getSlpGraphData } from "@/lib/graphs/slp/get-graph-data-slp";
import { getRasterMapGraphData } from "@/lib/graphs/raster-maps-data";

export const GRAPH_TYPES = {
  FLOOD_EXTEND: "flood-extend-graph",
  LINE_CHART: "line-chart",
  BAR_CHART: "bar-chart",
  PIE_CHART: "pie-chart",
};

/**
 * Graph type mask
 * @type {{cfhp: string, eesl: string, sc: string, slp: string, ssl: string, cba: string}}
 */
const GRAPH_TYPE_MASK = {
  cfhp: GRAPH_TYPES.PIE_CHART,
  cfhp_all_maps: GRAPH_TYPES.LINE_CHART,
  eesl: GRAPH_TYPES.LINE_CHART,
  sc: GRAPH_TYPES.LINE_CHART,
  slp: GRAPH_TYPES.BAR_CHART,
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
  const id = datasetId.split("_")[0];
  switch (id) {
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
          series: await getSlpGraphData(dataset, coords, props),
          time: props.find(({ id }) => id === "time").values.sort(),
          scenarios: props.find(({ id }) => id === "scenarios").values,
        };
      } catch (error) {
        console.error("Error while fetching data from getGraphDataSlp:", error);
        throw error;
      }
    case "pp_maps":
      return getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "pop_stats",
        keys: ["rel_affected", "abs_affected"],
        propertyName: ["LAU_NAME", "GISCO_ID"],
        unit: "percentage",
      });
    case "be_maps":
      return getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "be_stats",
        keys: ["rel_affected", "abs_affected"],
        propertyName: ["LAU_NAME", "GISCO_ID"],
        unit: "percentage",
      });
    case "bc_maps":
      return getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "bc_stats",
        keys: ["total"],
        propertyName: ["LAU_NAME", "GISCO_ID"],
        unit: "euro",
      });
    case "cfhp_all_maps":
      return getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "cfhp_all_stats",
        keys: ["flooded"],
        propertyName: ["LAU_NAME", "GISCO_ID"],
        unit: "percentage",
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

async function getLineSeriesData({
  dataset,
  coords,
  props,
  layerName,
  keys,
  propertyName,
  unit,
}) {
  try {
    const { id } = dataset;
    const { data, ...rest } = await getRasterMapGraphData({
      dataset,
      coords,
      props,
      layerName,
      keys,
      propertyName,
    });
    const scenarios = props.find(({ id }) => id === "scenarios").values;
    return {
      id,
      name: id,
      ...rest,
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
 * Get data for a zarr based dataset
 * @param dataset
 * @param features
 * @param props
 * @returns {Promise<{id: *, name: *, series: [{type: string, data: *[]}], xAxis: {type: string, data: *[]}}|{}|{id: *, name: *, series: [{data: *[], type: *, name: string}], xAxis: {type: string, data, title: string}, yAxis: {title: string}}>}
 */
export async function getZarrData(dataset, features, props) {
  const url = dataset?.assets?.data?.href;
  const datasetName = dataset?.id;
  const plotType = dataset?.["deltares:plotType"];
  const variables = dataset?.["cube:variables"];
  const xAxis = dataset?.["deltares:plotxAxis"];
  let path = Object.entries(variables)
    .filter(([, { type }]) => type === "data")
    .map(([key]) => key);
  path = plotType === "bar" ? path : path[0];
  const variableUnit = Object.entries(
    get(dataset, `["cube:variables"].${path}.unit`),
  );
  const cubeDimensions = get(dataset, "cube:dimensions");
  const plotSeries = get(dataset, "deltares:plotSeries");
  const dimensionNames = Object.entries(
    dataset?.["cube:dimensions"]?.[plotSeries]?.values,
  );
  const summaryList = dataset?.summaries;
  const slice = Object.values(variables?.[path]?.dimensions).map(
    (dimension) => {
      if (dimension === "stations") {
        return features?.properties?.locationId || 0;
      } else if (dimension === "nscenarios" && plotSeries !== "scenarios") {
        return summaryList
          .find((object) => object.id === "scenarios")
          ?.values.findIndex((scenario) => scenario === props.scenarios);
      } else if (
        dimension === "rp" &&
        (plotSeries !== "scenarios" || xAxis === "time")
      ) {
        return summaryList
          .find((object) => object.id === "rp")
          .values.findIndex((object) => {
            return object === props.rp;
          });
      } else {
        return null;
      }
    },
  );

  if (plotType !== "bar") {
    try {
      const res = await openArray({
        store: url,
        path: path,
        mode: "r",
      });

      const data = await res.get(slice);
      if (data.data.length > data.data[0].length || datasetName === "sc") {
        data.data = unzip(data.data);
      }

      let series = [
        {
          data: [],
          type: plotType,
          name: "",
        },
      ];

      if (typeof data.data[0].length === "undefined") {
        series[0].data = Array.from(data.data);
        series[0].type = plotType;
        series[0].name = "default";
      } else {
        series = data.data.map((serie) => ({
          type: "line",
          data: Array.from(serie).map((value) => value || 0),
        }));
      }
      if (cubeDimensions[xAxis].description === "decade window") {
        const startDateYear = new Date(cubeDimensions[xAxis].extent[0]);
        const endDateYear = new Date(cubeDimensions[xAxis].extent[1]);
        const decadeWindowSeries = [];
        for (
          let y = startDateYear.getFullYear();
          y <= endDateYear.getFullYear();
          y += 10
        ) {
          decadeWindowSeries.push(y);
        }
        cubeDimensions[xAxis].values = decadeWindowSeries;
      } else if (
        cubeDimensions[xAxis].description === "time" &&
        !Boolean(cubeDimensions[xAxis]?.values?.length)
      ) {
        cubeDimensions[xAxis].values = cubeDimensions[xAxis].extent;
      }
      const summary = summaryList.find(
        (summary) => summary.id === plotSeries || summary.id === "rp",
      );
      console.log({ summary, dimensionNames });
      series = series.map((serie, i, series) => ({
        ...serie,
        name:
          dimensionNames.length === series.length
            ? String(dimensionNames[i][1])
            : `${summary.id} ${String(summary?.allowedValues?.[i] || summary?.values[i])}`,
      }));
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
    } catch (error) {
      console.error("Error fetching data:", error);
      return {};
    }
  } else if (plotType === "bar") {
    const xAxisdata = [];
    const series = [];
    for (const p of path) {
      try {
        const res = await openArray({
          store: url,
          path: p,
          mode: "r",
        });
        const zarrData = await res.get(slice);
        series.push(zarrData);
        xAxisdata.push(p);
      } catch (error) {
        console.error("Error fetching bar data:", error);
      }
    }
    return {
      id: datasetName,
      name: datasetName,
      series: [{ type: "bar", data: series }],
      xAxis: {
        type: "category",
        data: xAxisdata,
      },
    };
  }
  return {};
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
