import { get, unzip } from "lodash-es";
import { openArray } from "zarr";
import { getSlpGraphData } from "@/lib/graphs/slp/get-graph-data-slp";

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
  pp: GRAPH_TYPES.LINE_CHART,
};

/**
 * Get graph type
 * @param id
 * @returns {*|string}
 */
export const getGraphType = (id) =>
  GRAPH_TYPE_MASK?.[id] || GRAPH_TYPES.LINE_CHART;

// const valueLabels = {
//   cfhp: {
//     more05: "% flood > 0.5m",
//     less05: "% flood < 0.5m",
//     nans: "% not flooded",
//   },
// };
// const getValueLabels = (datasetId, key) => {
//   if (valueLabels?.[datasetId]) {
//     Object.entries(valueLabels[datasetId]).find(([k]) => k === key)[1];
//   }
// };

/**
 * Get graph feature data for a dataset with a WMTS geoserver_link
 * @param datasetId
 * @param feature
 * @param properties
 * @param values
 * @returns {{id, name, xAxis: {data: *, title: string}, yAxis: {type: string, min: number, alignTicks, max: number, interval: number, axisLabel: {formatter: function(*): string}, nameTextStyle: {color: string, fontFamily: string}, name: string, nameLocation: string}[], series: *}|{name: *, value: *}[]|{name: string, value: *}[]|[string, unknown][]}
 */
export function getFeatureData({ datasetId, feature, properties, values }) {
  switch (datasetId) {
    case "cba": {
      return Object.entries(feature)
        .filter(
          ([key]) =>
            key.toLowerCase().includes(values.time.toLowerCase()) &&
            key.toLowerCase().includes(values.scenarios.toLowerCase())
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
    case "pp": {
      const dataColRegex =
        /(?<defense>[\da-zA-Z_-]+)\\(?<rp>[\da-zA-Z_-]+)\\(?<climateScenario>[\da-zA-Z_-]+)\\(?<time>\d+)\\population_(?<scenario>[\da-zA-Z_-]+)\\(?<type>[\da-zA-Z_-]+)/;
      const times = properties.find(({ id }) => id === "time").values;
      const scenarios = properties.find(({ id }) => id === "scenarios").values;
      const data = Object.entries(feature)
        .filter(([key]) => dataColRegex.test(key))
        .map(([key, value]) => ({
          ...key.match(dataColRegex).groups,
          value,
        }));

      // const colors = ["#000000", "#173c66", "#f79320", "#951b1e"];
      return {
        id: datasetId,
        name: datasetId,
        xAxis: {
          data: times,
          title: "Year",
        },
        yAxis: ["rel_affected", "abs_affected"].flatMap((type) => ({
          type: "value",
          min: 0,
          alignTicks: !type.startsWith("rel"),
          max: Math.max(
            ...data
              .filter((datum) => datum.type === type)
              .map(({ value }) => value)
          ),
          interval: type.startsWith("rel") ? 0.1 : 10000,
          axisLabel: {
            formatter: (value) =>
              type.startsWith("rel")
                ? `${parseInt(value * 100)}%`
                : `${value / 1000}k`,
          },
          nameTextStyle: {
            color: "black",
            fontFamily: "Helvetica",
          },
          name: type.startsWith("rel") ? "Percentage" : "Amount",
          nameLocation: "start",
        })),
        series: scenarios.flatMap((scenario) =>
          ["rel_affected", "abs_affected"].flatMap((type) => ({
            name: `${scenario} ${type.startsWith("rel") ? "%" : "#"}`,
            type: type.startsWith("rel") ? "line" : "line",
            yAxisIndex: type.startsWith("rel") ? 0 : 1,
            tooltip: {
              valueFormatter: function (value) {
                return type.startsWith("rel")
                  ? `${parseFloat(value * 100).toFixed(2)}%`
                  : `${parseFloat(value).toFixed(2)} people`;
              },
            },
            data: data
              .filter(
                (datum) =>
                  datum.type === type &&
                  datum.scenario === scenario &&
                  datum.climateScenario.startsWith(datum.scenario) &&
                  datum.defense === "UNDEFENDED_MAPS" &&
                  datum.rp === "100"
              )
              .sort((a, b) => a.time - b.time)
              .map(({ value }) => {
                return value;
              }),
          }))
        ),
      };
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
    default:
      console.warn(`No handler for dataset id: ${id}`);
      return null;
  }
}

/**
 * Get data for a zarr based dataset
 * @param dataset
 * @param features
 * @param props
 * @returns {Promise<null>}
 */
export async function getZarrData(dataset, features, props) {
  const url = dataset?.assets?.data?.href;
  const datasetName = dataset?.id;
  const variables = Object.entries(get(dataset, "cube:variables"));

  let path = [];
  variables.forEach((dim) => {
    if (dim[1].type === "data") {
      path.push(dim[0]);
    }
  });

  var dimensions = [];
  if (get(dataset, "deltares:plotType") !== "bar") {
    path = path.filter((x) => x)[0];
    dimensions = Object.entries(
      get(dataset, `["cube:variables"].${path}.dimensions`)
    );
  } else if (get(dataset, "deltares:plotType") === "bar") {
    dimensions = Object.entries(
      get(dataset, `["cube:variables"].${path[0]}.dimensions`)
    );
  }

  const summaryList = get(dataset, "summaries");
  let slice = dimensions.map((dim) => {
    if (dim[1] === "stations") {
      return get(features, "properties.locationId", 0);
    } else if (
      dim[1] === "nscenarios" &&
      get(dataset, "deltares:plotSeries") !== "scenarios"
    ) {
      const scenarioIndex = summaryList.find(
        (object) => object.id === "scenarios"
      );
      return scenarioIndex?.values.findIndex(
        (scenario) => scenario === props.scenarios
      );
    } else if (
      dim[1] === "rp" &&
      get(dataset, "deltares:plotSeries") !== "scenarios"
    ) {
      return summaryList
        .find((object) => object.id === "rp")
        .values.findIndex((object) => {
          return object === props.rp;
        });
    } else {
      return null;
    }
  });
  let graphData = null;

  if (get(dataset, "deltares:plotType") !== "bar") {
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
          type: get(dataset, "deltares:plotType"),
          name: "",
        },
      ];

      if (typeof data.data[0].length === "undefined") {
        series[0].data = Array.from(data.data);
        series[0].type = get(dataset, "deltares:plotType");
        series[0].name = "default";
      } else {
        series = data.data.map((serie) => {
          return {
            type: "line",
            data: Array.from(serie),
          };
        });
      }

      const variableUnit = Object.entries(
        get(dataset, `["cube:variables"].${path}.unit`)
      );

      let cubeDimensions = get(dataset, "cube:dimensions");
      const xAxis = get(dataset, "deltares:plotxAxis");
      const plotSeries = get(dataset, "deltares:plotSeries");

      const dimensionNames = Object.entries(
        get(dataset, `cube:dimensions.${plotSeries}.values`)
      );

      if (cubeDimensions[xAxis].description === "decade window") {
        const startDateYear = new Date(cubeDimensions[xAxis].extent[0]);
        const endDateYear = new Date(cubeDimensions[xAxis].extent[1]);

        var decadeWindowSeries = [];

        for (
          let y = startDateYear.getFullYear();
          y <= endDateYear.getFullYear();
          y += 10
        ) {
          decadeWindowSeries.push(y);
        }

        cubeDimensions[xAxis].values = decadeWindowSeries;
      } else if (cubeDimensions[xAxis].description === "time") {
        cubeDimensions[xAxis].values = cubeDimensions[xAxis].extent;
      }

      for (var i = 0; i < series.length; i++) {
        if (dimensionNames.length === series.length) {
          if (typeof dimensionNames[i][1] === "number") {
            series[i].name = String(dimensionNames[i][1]);
          } else if (typeof dimensionNames[i][1] === "string") {
            series[i].name = dimensionNames[i][1];
          }
        } else {
          summaryList.map((summary) => {
            if (summary.id === plotSeries || summary.id === "rp") {
              series[i].name =
                summary.id + " " + String(summary.allowedValues[i]);
            }
          });
        }
      }

      graphData = {
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
    }
  } else if (get(dataset, "deltares:plotType") === "bar") {
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

        graphData = {
          id: datasetName,
          name: datasetName,
          series: [{ type: "bar", data: series }],
          xAxis: {
            type: "category",
            data: xAxisdata,
          },
        };
      } catch (error) {
        console.error("Error fetching bar data:", error);
      }
    }
  }
  return graphData;
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
    const totalInSet = graphValues?.find?.(({ name }) =>
      name.toLowerCase().includes("total")
    );
    const _values = totalInSet
      ? graphValues.filter(({ name }) => name !== totalInSet.name)
      : graphValues;
    const total =
      totalInSet || Math.ceil(values.reduce((acc, cur) => acc + cur.value, 0));
    return {
      total,
      values: _values,
      datasetId,
      graphType,
      coords,
    };
  }
}
