import _ from "lodash";
import getDataFromRaster from "@/lib/graphs/get-data-from-raster";

export default {
  namespaced: true,
  state: {
    currentGraphDataset: null,
    graphData: null,
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
    EMPTY_GRAPH_DATA(state) {
      state.graphData = null;
    },
  },
  actions: {
    emptyGraphData({ commit }) {
      commit("EMPTY_GRAPH_DATA");
    },
    addCurrentGraphDataset({ commit }, dataset) {
      commit("ADD_CURRENT_GRAPH_DATASET", dataset);
    },
    async getGraphData({ rootGetters, commit }, { lng, lat }) {
      //Retrieve the activeClickableDataset and replace the lines below
      const activeDatasets = rootGetters["map/activeDatasets"];
      const currentGraphDataset = activeDatasets.find(
        (dataset) => dataset.id === "slp"
      );

      //1. getGraphdata means populate the graphData object with the data
      //2. cases: vector: click on the map and read the data directly.
      //3. cases: vector: click on the map and read data from zarr. With an extra request
      //4. cases: raster: click on the map and read the data from the geoserver with an extra getFetaureInfo request

      const layerType = _.has(currentGraphDataset, "cube:dimensions")
        ? "vector"
        : "raster";
      if (layerType === "raster") {
        getDataFromRaster(currentGraphDataset, lng, lat).then((graphData) => {
          commit("ADD_GRAPH_DATA", graphData);
        });
      }
    },
  },
};
