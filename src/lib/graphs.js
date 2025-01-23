import getGraphDataSlp from "@/lib/graphs/slp/get-graph-data-slp";
import { get, unzip } from "lodash-es";
import { openArray } from "zarr";

export const GRAPH_TYPES = {
  FLOOD_EXTEND: "flood-extend-graph",
  LINE_CHART: "line-chart-zarr",
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
 * Get data for a dataset with a WMTS geoserver_link
 * @param dataset
 * @param properties
 * @param values
 * @returns {{name: *, value: *}[]|{[p: string]: unknown}}
 */
export function getFeatureData(dataset, properties, values) {
  switch (dataset) {
    case "cba":
      return Object.entries(properties)
        .filter(([key]) => key.includes(values.time))
        .map(([name, value]) => {
          return {
            name,
            value,
          };
        });
    case "cfhp": {
      const scenarios =
        values.scenarios !== "none"
          ? values.scenarios.toLowerCase()
          : "mean_spring_tide";
      const time = values?.time.toLowerCase() || "";
      const defenseLevel = values?.["defense level"].toLowerCase() || "";
      return Object.entries(properties)
        .filter(([_key]) => {
          const key = _key.toLowerCase();
          return (
            key.includes(time) &&
            key.includes(scenarios) &&
            key.includes(defenseLevel)
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
      return Object.fromEntries(
        Object.entries(properties).filter(([key]) => key.includes(dataset))
      );
  }
}

/**
 * Get data for a raster based dataset and location
 * @param dataset
 * @param lng
 * @param lat
 * @returns {Promise<*|null>}
 */
export async function getRasterData(dataset, lng, lat) {
  const { id } = dataset;

  switch (id) {
    case "slp":
      try {
        return await getGraphDataSlp(dataset, lng, lat);
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
