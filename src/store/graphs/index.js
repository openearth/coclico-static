import _ from "lodash";
import getDataFromRaster from "@/lib/graphs/get-data-from-raster";
import getDataFromZarr from "@/lib/graphs/get-data-from-zarr";

export default {
  namespaced: true,
  state: {
    graphData: null,
  },
  getters: {
    graphData(state) {
      return state.graphData;
    },
  },
  mutations: {
    ADD_GRAPH_DATA(state, data) {
      console.log("graphData in mutation", data);
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

    async getGraphData({ rootGetters, commit }, { lng, lat }, features) {
      const currentGraphDataset = rootGetters["map/activeClickableDataset"];
      if (!currentGraphDataset) {
        return;
      }

      const layerType = _.has(currentGraphDataset, "cube:dimensions")
        ? "vector"
        : "raster";

      if (layerType === "raster") {
        try {
          const graphData = await getDataFromRaster(
            currentGraphDataset,
            lng,
            lat
          );
          console.log("graphData in action", graphData);
          commit("ADD_GRAPH_DATA", graphData);
        } catch (error) {
          console.error("Error getting raster data:", error);
        }
      } else {
        const type = _.get(currentGraphDataset, "assets.data.roles").includes(
          "zarr-root"
        )
          ? "zarr"
          : "mapbox";

        if (type === "zarr") {
          try {
            const graphData = await getDataFromZarr(
              currentGraphDataset,
              features
            );
            console.log("graphData in action", graphData);
            commit("ADD_GRAPH_DATA", graphData);
          } catch (error) {
            console.error("Error getting zarr data:", error);
          }
        } else {
          console.log("Mapbox data not implemented yet");
        }
      }
    },
  },
};
