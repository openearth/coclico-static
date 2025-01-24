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
            features:
              queriedFeatures?.find((feature) =>
                feature?.layer?.id.endsWith("_geoserver_link")
              ) ||
              queriedFeatures?.find((feature) =>
                rootGetters["map/clickableDatasetsIds"].some((id) =>
                  feature.layer.id.startsWith(id)
                )
              ),
            point,
          });
          break;
      }
      dispatch("setGraphData");
    },
    async setGraphData({ rootGetters, getters, commit }) {
      const graphFeature = getters.graphFeature;
      if (!graphFeature?.lng || !graphFeature?.lat || !graphFeature?.dataset)
        return;
      const { lng, lat, dataset } = graphFeature;
      const coords = { lng, lat };
      const currentDataset = rootGetters["datasets/activeDatasets"].find(
        ({ id }) => id === dataset
      );
      if (!currentDataset) return;
      const activeProps = rootGetters["datasets/activeDatasetValues"](dataset);
      const graphType = getGraphType(dataset);
      const layerType = getLayerType(graphFeature?.features?.layer);
      if (layerType === "clickable" && graphFeature?.features) {
        const graphValues = getFeatureData(
          dataset,
          graphFeature?.features.properties,
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
        if (!values.length) {
          commit("EMPTY_GRAPH_DATA");
          commit("ADD_GRAPH_FEATURE");
          return;
        }
        commit("ADD_GRAPH_DATA", {
          total,
          values,
          datasetId: dataset,
          graphType,
          coords,
        });
      }
      if (layerType === "geojson" && graphFeature?.features) {
        if (!currentDataset?.assets?.data?.roles?.includes("zarr-root"))
          console.error("Mapbox data not implemented yet");
        try {
          const graphData = await getZarrData(
            currentDataset,
            graphFeature?.features,
            activeProps
          );
          if (!graphData) {
            commit("EMPTY_GRAPH_DATA");
            commit("ADD_GRAPH_FEATURE");
            return;
          }
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

      if (!layerType) {
        try {
          const graphData = await getRasterData(
            currentDataset,
            coords,
            rootGetters["datasets/activeDatasetProperties"](dataset)
          );
          if (!graphData.values[0].data[0]) {
            commit("EMPTY_GRAPH_DATA");
            commit("ADD_GRAPH_FEATURE");
            return;
          }
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
