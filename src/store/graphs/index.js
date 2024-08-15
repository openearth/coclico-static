import _ from "lodash";

export default {
  namespaced: true,
  state: {},
  getters: {},
  mutations: {},
  actions: {
    getGraphData({ rootGetters }) {
      const activeDatasets = rootGetters["map/activeDatasets"];
      const testActiveDataset = activeDatasets[0];

      const layerType = _.has(testActiveDataset, "cube:dimensions")
        ? "vector"
        : "raster";
      if (layerType === "raster") {
        //getFeatureInfo
        console.log("getFeatureInfo Request");
      } else {
        //make the other request for the vectors.
      }
    },
  },
};
