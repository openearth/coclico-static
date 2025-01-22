import { getFeatureData, getGraphTitle, getGraphType } from "@/lib/graphs";

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
      { queriedFeatures, datasetId, lat, lng }
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
            features: queriedFeatures[0],
          });
          break;
      }
      dispatch("setGraphData");
    },
    setGraphData({ rootGetters, getters, commit }) {
      const graphFeature = getters.graphFeature;
      if (
        !graphFeature?.features ||
        !graphFeature?.lng ||
        !graphFeature?.lat ||
        !graphFeature?.dataset
      )
        return;
      const { features, lng, lat, dataset } = graphFeature;
      const currentDataset = rootGetters["datasets/activeDatasets"].find(
        ({ id }) => id === dataset
      );
      if (!currentDataset) return;
      const activeProps = rootGetters["datasets/activeDatasetValues"](dataset);
      const graphType = getGraphType(dataset);
      const title = getGraphTitle(dataset);
      if (currentDataset?.assets?.geoserver_link) {
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
          title,
          total,
          values,
          datasetId: dataset,
          graphType,
          coords: { lng, lat },
        });
      }
    },
  },
};
