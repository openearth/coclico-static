import {
  getFeatureData,
  getGraphType,
  getRasterData,
  getZarrData,
} from "@/lib/graphs";
import { getLayerType } from "@/lib/layers";

export default {
  namespaced: true,
  state: {
    graphData: null,
    graphFeature: null,
  },
  getters: {
    graphData: (state) => state.graphData,
    graphFeature: (state) => state.graphFeature,
  },
  mutations: {
    ADD_GRAPH_DATA(state, data) {
      state.graphData = data;
    },
    ADD_GRAPH_FEATURE(state, data) {
      state.graphFeature = data;
    },
    EMPTY_GRAPH_DATA(state) {
      state.graphData = null;
    },
  },
  actions: {
    emptyGraphData({ commit }) {
      commit("EMPTY_GRAPH_DATA");
    },
    setGraphFeature(
      { commit, dispatch, rootGetters },
      { queriedFeatures, datasetId, lat, lng, point }
    ) {
      const properties = rootGetters["datasets/activeDatasetValues"](datasetId);
      switch (datasetId) {
        case "cba":
          commit("ADD_GRAPH_FEATURE", {
            dataset: datasetId,
            lng,
            lat,
            features:
              queriedFeatures.find(
                (feature) =>
                  feature?.properties?.scenarios === properties?.scenarios
              ) || queriedFeatures[0],
          });
          break;
        default:
          commit("ADD_GRAPH_FEATURE", {
            dataset: datasetId,
            lng,
            lat,
            features: queriedFeatures?.find((feature) =>
              feature?.layer?.id.endsWith("_geoserver_link")
            ),
            point,
          });
          break;
      }
      dispatch("setGraphData");
    },
    async setGraphData({ rootGetters, getters, commit }) {
      const graphFeature = getters.graphFeature;
      if (
        !graphFeature?.features ||
        !graphFeature?.lng ||
        !graphFeature?.lat ||
        !graphFeature?.dataset
      )
        return;
      const { features, lng, lat, dataset } = graphFeature;
      const coords = { lng, lat };
      const currentDataset = rootGetters["datasets/activeDatasets"].find(
        ({ id }) => id === dataset
      );
      if (!currentDataset) return;
      const activeProps = rootGetters["datasets/activeDatasetValues"](dataset);
      const graphType = getGraphType(dataset);
      const layerType = getLayerType(graphFeature.features.layer);

      if (layerType === "clickable") {
        const graphValues = getFeatureData(
          dataset,
          features.properties,
          activeProps
        );
        const totalInSet = graphValues.find(({ name }) =>
          name.toLowerCase().includes("total")
        );
        const values = totalInSet
          ? graphValues.filter(({ name }) => name !== totalInSet.name)
          : graphValues;
        const total =
          totalInSet ||
          Math.ceil(values.reduce((acc, cur) => acc + cur.value, 0));

        commit("ADD_GRAPH_DATA", {
          total,
          values,
          datasetId: dataset,
          graphType,
          coords,
        });
      }
      if (layerType === "geojson") {
        if (!currentDataset?.assets?.data?.roles?.includes("zarr-root"))
          console.error("Mapbox data not implemented yet");
        try {
          const graphData = await getZarrData(
            currentDataset,
            features,
            activeProps
          );
          commit("ADD_GRAPH_DATA", { ...graphData, graphType, coords });
          commit("ADD_GRAPH_DATA", {
            ...graphData,
            datasetId: dataset,
            graphType,
            coords,
          });
        } catch (error) {
          console.error("Error getting zarr data:", error);
        }
      }

      if (layerType === "raster") {
        try {
          const graphData = await getRasterData(currentDataset, lng, lat);
          commit("ADD_GRAPH_DATA", {
            ...graphData,
            datasetId: dataset,
            graphType,
            coords,
          });
        } catch (error) {
          console.error("Error getting raster data:", error);
        }
      }
    },
  },
};
