/***
 * reads the dataset id and based on the dataset case it creates the series for the graph */
import getGraphDataSlp from "./slp/get-graph-data-slp";

export default async function (dataset, lng, lat) {
  console.log("dataset", dataset, lng, lat);
  const { id } = dataset;

  switch (id) {
    case "slp":
      try {
        const result = await getGraphDataSlp(dataset, lng, lat);
        console.log("Data successfully retrieved:", result);
        return result;
      } catch (error) {
        console.error("Error while fetching data from getGraphDataSlp:", error);
        throw error;
      }
    default:
      console.warn(`No handler for dataset id: ${id}`);
      return null;
  }
}
