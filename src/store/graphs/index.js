import _ from "lodash";
import getFeatureInfo from "@/lib/geoserver_utils/get-feature-info";

export default {
  namespaced: true,
  state: {
    currentGraphDataset: null,
    graphData: [],
  },
  getters: {
    currentGraphDataset(state) {
      return state.currentGraphDataset;
    },
    graphData(state) {
      return state.graphData;
    },
  },
  mutations: {
    ADD_CURRENT_GRAPH_DATASET(state, dataset) {
      state.currentGraphDataset = dataset;
    },
    ADD_GRAPH_DATA(state, data) {
      state.graphData = data;
    },
  },
  actions: {
    addCurrentGraphDataset({ commit }, dataset) {
      commit("ADD_CURRENT_GRAPH_DATASET", dataset);
    },
    async getGraphData({ rootGetters, commit }, { lng, lat }) {
      const activeDatasets = rootGetters["map/activeDatasets"];
      const currentGraphDataset = activeDatasets.find(
        (dataset) => dataset.id === "slp"
      );

      //slpActiveDataset

      const layerType = _.has(currentGraphDataset, "cube:dimensions")
        ? "vector"
        : "raster";
      if (layerType === "raster") {
        const seaLevelRiseData = currentGraphDataset.series;
        const promises = [];

        // Loop through each scenario
        seaLevelRiseData.scenarios.forEach((scenario) => {
          // Loop through each ensemble (msl_h, msl_m, msl_l)
          ["msl_h", "msl_m", "msl_l"].forEach((mslType) => {
            const layerNames = scenario[mslType].layer_names;

            // Create a Promise for each API request
            const promise = getFeatureInfo({
              layers: layerNames,
              url: "https://coclico.avi.deltares.nl/geoserver/slp/wms",
              lng,
              lat,
            })
              .then((data) => {
                // Store the result in the values array for this ensemble
                scenario[mslType].values = data;
              })
              .catch((error) => {
                console.error(`Error fetching data for ${mslType}:`, error);
              });

            promises.push(promise); // Collect the promises
          });
        });

        // Wait for all promises to resolve
        Promise.all(promises)
          .then(() => {
            commit("ADD_GRAPH_DATA", seaLevelRiseData);
            console.log(JSON.stringify(seaLevelRiseData, null, 2)); // Final result
          })
          .catch((error) => {
            console.error("Error in Promise.all:", error);
          });
      }
    },
  },
};
