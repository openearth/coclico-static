import _ from "lodash";
import getDataFromRaster from "@/lib/graphs/get-data-from-raster";
import getDataFromZarr from "@/lib/graphs/get-data-from-zarr";
import getDataFromMapbox from "@/lib/graphs/get-data-from-mapbox";

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

    async getGraphData({ rootGetters, commit }, { lng, lat, features }) {
      //TODO: after demo refactor the if statements
      const currentGraphDataset = rootGetters["map/activeClickableDataset"];
      const mapboxLayers = rootGetters["map/mapboxLayers"];
      if (!currentGraphDataset) {
        return;
      }
      if (_.has(currentGraphDataset, "transparentLayer")) {
        const mapboxLayer = mapboxLayers.find(
          (layer) => layer.id === currentGraphDataset.id
        );

        const graphData = getDataFromMapbox(mapboxLayer, features.properties);
        commit("ADD_GRAPH_DATA", graphData);
      } else {
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
              commit("ADD_GRAPH_DATA", graphData);
            } catch (error) {
              console.error("Error getting zarr data:", error);
            }
          } else {
            console.log("Mapbox data not implemented yet");
          }
        }
      }
    },
  },
};
