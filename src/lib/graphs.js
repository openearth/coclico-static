import { get } from "lodash-es";
import { openArray } from "zarr";
import { getSlpGraphData } from "@/lib/graphs/slp/get-graph-data-slp";
import { getRasterMapGraphData } from "@/lib/graphs/raster-maps-data";

export const GRAPH_TYPES = {
  FLOOD_EXTEND: "flood-extend-graph",
  LINE_CHART: "line-chart",
  BAR_CHART: "bar-chart",
  STACKED_BAR_CHART: "stacked-bar-chart",
  PIE_CHART: "pie-chart",
};

/**
 * Graph type mask
 * @type {{pie: string, line: string, stacked_series: string, bar: string}}
 */
const GRAPH_TYPE_MASK = {
  pie: GRAPH_TYPES.PIE_CHART,
  line: GRAPH_TYPES.LINE_CHART,
  stacked_series: GRAPH_TYPES.STACKED_BAR_CHART,
  bar: GRAPH_TYPES.BAR_CHART,
};

/**
 * Get graph type
 * @param dataset
 * @returns {*|string}
 */
export const getGraphType = (dataset) => {
  return (
    GRAPH_TYPE_MASK?.[dataset?.["deltares:plotType"]] || GRAPH_TYPES.LINE_CHART
  );
};

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
    case "pp_maps": {
      const unit = "percentage";
      const data = await getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "pop_stats",
        keys: ["rel_affected"],
        propertyName: [
          "abs_affected",
          "LAU_NAME",
          "GISCO_ID",
          "return_period",
          "scenario",
          "time",
          "map_type",
        ],
        unit,
      });
      return {
        ...data,
        tooltip: {
          valueFormatter: (value, index) => {
            const serie = data.series.find(
              (serie) => serie.data[index] === value,
            );
            if (!serie) return unitFormatter({ unit, value });
            return `${unitFormatter({
              unit,
              value,
            })} (${unitFormatter({ unit: "integer", value: serie.sourceData[index].abs_affected })})`;
          },
        },
      };
    }
    case "be_maps": {
      const unit = "percentage";
      const data = await getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "be_stats",
        keys: ["rel_affected"],
        propertyName: [
          "abs_affected",
          "LAU_NAME",
          "GISCO_ID",
          "return_period",
          "scenario",
          "time",
          "map_type",
        ],
        unit,
      });
      return {
        ...data,
        tooltip: {
          valueFormatter: (value, index) => {
            const serie = data.series.find(
              (serie) => serie.data[index] === value,
            );
            if (!serie) return unitFormatter({ unit, value });
            return `${unitFormatter({
              unit,
              value,
            })} / ${unitFormatter({ unit: "integer", value: serie.sourceData[index].abs_affected })}`;
          },
        },
      };
    }
    case "bc_maps":
      return getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "bc_stats",
        keys: ["total"],
        propertyName: [
          "LAU_NAME",
          "GISCO_ID",
          "return_period",
          "scenario",
          "time",
          "map_type",
        ],
        unit: "euro",
      });
    case "cfhp_all_maps":
      return getLineSeriesData({
        dataset,
        coords,
        props,
        layerName: "cfhp_all_stats",
        keys: ["flooded"],
        propertyName: [
          "LAU_NAME",
          "GISCO_ID",
          "return_period",
          "scenario",
          "time",
          "map_type",
        ],
        unit: "percentage",
      });
    default:
      console.warn(`No handler for dataset id: ${id}`);
      return null;
  }
}

const unitFormatter = ({ unit, value }) => {
  switch (unit) {
    case "percentage":
      return `${(parseFloat(value) * 100).toFixed(2)}%`;
    case "euro":
      return `€${parseFloat(value).toFixed(0)}`;
    case "integer":
      return parseFloat(value).toFixed(0);
    default:
      return parseFloat(value).toFixed(2);
  }
};

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
    const series = scenarios.flatMap((scenario) =>
      keys.flatMap((key) => {
        const sourceData = data
          .filter(
            (datum) =>
              datum.scenario === scenario &&
              (datum?.defenseLevel || datum?.map_type) ===
                props.find((prop) => prop.id === "defense level").value &&
              (datum.rp || datum?.return_period) ===
                props.find((prop) => prop.id === "return period").value,
          )
          .sort((a, b) => a.time - b.time);
        return {
          name: `${scenario} ${keys.length > 1 ? ` ${key}` : ""}`,
          type: "line",
          sourceData: sourceData,
          key,
          data: sourceData.map(({ value, ...rest }) => value?.[key] || value),
        };
      }),
    );

    return {
      id,
      name: id,
      ...rest,
      tooltip: {
        valueFormatter: (value) => unitFormatter({ unit, value }),
      },
      series,
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
  const plotType = dataset?.["deltares:plotType"];

  switch (plotType) {
    case "line":
      try {
        return getZarrLineData(dataset, features, props);
      } catch (error) {
        console.error("Error fetching line data:", error);
        return {};
      }
    case "bar": {
      try {
        return await getZarrBarData(dataset, features, props);
      } catch (error) {
        console.error("Error fetching bar data:", error);
        return {};
      }
    }
    default:
      return {};
  }
}

async function getZarrBarData(dataset, features, props) {
  const url = dataset?.assets?.data?.href;
  const datasetName = dataset?.id;
  const plotType = dataset?.["deltares:plotType"];
  const variables = dataset?.["cube:variables"];
  const xAxis = dataset?.["deltares:plotxAxis"];
  let path = Object.entries(variables)
    .filter(([, { type }]) => type === "data")
    .map(([key]) => key);
  const plotSeries = get(dataset, "deltares:plotSeries");
  const summaryList = dataset?.summaries;

  const slice = Object.values(variables?.[path[0]]?.dimensions).map(
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
        return 0;
      }
    },
  );

  const xAxisdata = [];
  const series = [];
  for (const p of path) {
    try {
      const res = await openArray({
        store: url,
        path: p,
        mode: "r",
      });
      const data = await res.get(slice);
      series.push(data);
      xAxisdata.push(p);
    } catch (error) {
      console.error("Error fetching bar data:", error);
    }
  }
  const colorPalette = ["#004c6d", "#3d708f", "#6996b3", "#94bed9"];
  return {
    id: datasetName,
    name: datasetName,
    colorPalette,
    series: {
      type: "bar",
      data: series.map((value, index) => ({
        value,
        itemStyle: {
          color: colorPalette[index % colorPalette.length],
        },
      })),
    },
    xAxis: {
      type: "category",
      data: xAxisdata,
    },
  };
}

function getZarrLineData(dataset, features, props) {
  const datasetName = dataset?.id;
  const plotType = dataset?.["deltares:plotType"];
  const variables = dataset?.["cube:variables"];
  const xAxis = dataset?.["deltares:plotxAxis"];
  let path = Object.entries(variables)
    .filter(([, { type }]) => type === "data")
    .map(([key]) => key);
  const variableUnit = Object.entries(
    get(dataset, `["cube:variables"].${path}.unit`),
  );
  const cubeDimensions = get(dataset, "cube:dimensions");
  const plotSeries = get(dataset, "deltares:plotSeries");

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
  }
  const slice = variables?.[path]?.dimensions
    .filter((dimension) => dimension !== "stations")
    .map(
      (dimension) =>
        Object.keys(cubeDimensions).find((cubeDimension) =>
          dimension.includes(cubeDimension),
        ) || dimension,
    )
    .map((dimension) =>
      dimension === plotSeries || dimension === xAxis
        ? cubeDimensions[dimension]?.values.map(
            (value) => `${dimension}-${value}`,
          )
        : Object.entries(props)
            .filter(([key]) => key === dimension)
            .map(([key, value]) => {
              if (/^\d+$/.test(String(value))) {
                value = Number(value).toFixed(1).toString();
              }
              return [key, value].join("-");
            }),
    );
  const data = cubeDimensions[plotSeries]?.values.map((name) => ({
    name,
    type: plotType,
    data: Object.entries(features.properties)
      .filter(
        ([key]) =>
          key.includes(name) &&
          slice.every((prop) => prop.some((value) => key.includes(value))),
      )
      .sort(([keyA], [keyB]) => {
        const keyAIndex = cubeDimensions[xAxis].values.findIndex((value) =>
          keyA.includes(value),
        );
        const keyBIndex = cubeDimensions[xAxis].values.findIndex((value) =>
          keyB.includes(value),
        );
        return keyAIndex - keyBIndex;
      })
      .map(([, value]) => value),
  }));
  return {
    id: datasetName,
    name: datasetName,
    series: data,
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
