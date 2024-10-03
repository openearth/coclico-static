/**
 * Function that has as input the dataset
 * and creates the layerNames list
 * workspace is always the dataset id
 * layerName is constructed from the properties of each item
 * propertyNames are read from the summaries
 */

export default function (dataset) {
  // Early return if dataset is falsy
  if (!dataset) return;
  // Create a dynamic seaLevelRiseData object
  const series = {};

  // Extract time array
  const timeValues = dataset.summaries
    .find((summary) => summary.id === "time")
    .allowedValues.map((timeValue) => parseInt(timeValue, 10));
  // Build scenarios dynamically
  series.scenarios = dataset.summaries
    .find((summary) => summary.id === "scenarios")
    .allowedValues.map((scenario) => {
      const ensemble = dataset.summaries.find(
        (s) => s.id === "ensemble"
      ).allowedValues;

      const scenarioObj = { name: scenario };
      ensemble.forEach((e) => {
        scenarioObj[e] = {
          layer_names: timeValues.map((time) => `${scenario}_${e}_${time}`), // Dynamically create layer names for each ensemble type
          values: [], // Empty values array for now
        };
      });
      return scenarioObj;
    });

  // Add time array
  series.time = timeValues;

  return series;
}
