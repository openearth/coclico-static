import _ from "lodash";
import { openArray } from "zarr";

export default async function (dataset, features) {
  const url = _.get(dataset, "assets.data.href");
  const datasetName = _.get(dataset, "id");

  const variables = Object.entries(_.get(dataset, "cube:variables"));

  let path = [];
  variables.forEach((dim) => {
    if (dim[1].type === "data") {
      path.push(dim[0]);
    }
  });

  var dimensions = [];
  if (_.get(dataset, "deltares:plotType") !== "bar") {
    path = path.filter((x) => x)[0];
    dimensions = Object.entries(
      _.get(dataset, `["cube:variables"].${path}.dimensions`)
    );
  } else if (_.get(dataset, "deltares:plotType") === "bar") {
    dimensions = Object.entries(
      _.get(dataset, `["cube:variables"].${path[0]}.dimensions`)
    );
  }

  const summaryList = _.get(dataset, "summaries");

  let slice = dimensions.map((dim) => {
    if (dim[1] === "stations") {
      return _.get(features, "properties.locationId", 0);
    } else if (
      dim[1] === "nscenarios" &&
      _.get(dataset, "deltares:plotSeries") !== "scenarios"
    ) {
      const scenarioIndex = summaryList.find(
        (object) => object.id === "scenarios"
      );

      return scenarioIndex.allowedValues.findIndex((object) => {
        return (
          object ===
          summaryList.find((object) => object.id === "scenarios").chosenValue
        );
      });
    } else if (
      dim[1] === "rp" &&
      _.get(dataset, "deltares:plotSeries") !== "scenarios"
    ) {
      return summaryList
        .find((object) => object.id === "rp")
        .allowedValues.findIndex((object) => {
          return (
            object ===
            summaryList[summaryList.findIndex((object) => object.id === "rp")]
              .chosenValue
          );
        });
    } else {
      return null;
    }
  });

  let graphData = null;

  if (_.get(dataset, "deltares:plotType") !== "bar") {
    try {
      const res = await openArray({
        store: url,
        path: path,
        mode: "r",
      });

      const data = await res.get(slice);

      if (data.data.length > data.data[0].length || datasetName === "sc") {
        data.data = _.unzip(data.data);
      }

      let series = [
        {
          data: [],
          type: _.get(dataset, "deltares:plotType"),
          name: "",
        },
      ];

      if (typeof data.data[0].length === "undefined") {
        series[0].data = Array.from(data.data);
        series[0].type = _.get(dataset, "deltares:plotType");
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
        _.get(dataset, `["cube:variables"].${path}.unit`)
      );

      let cubeDimensions = _.get(dataset, "cube:dimensions");
      const xAxis = _.get(dataset, "deltares:plotxAxis");
      const plotSeries = _.get(dataset, "deltares:plotSeries");

      const dimensionNames = Object.entries(
        _.get(dataset, `cube:dimensions.${plotSeries}.values`)
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
            if (summary.id === plotSeries || summary.id == "rp") {
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
  } else if (_.get(dataset, "deltares:plotType") === "bar") {
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
