import {
  getGraphType,
  getGraphTypeData,
  getRasterData,
  getZarrData,
} from "@/lib/graphs";
import { getLayerType } from "@/lib/layers";
import { toast } from "vue-sonner";

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
      { queriedFeatures, datasetId, lat, lng, point },
    ) {
      commit("ADD_GRAPH_FEATURE", {
        dataset: datasetId,
        lng,
        lat,
        features:
          queriedFeatures?.find((feature) =>
            feature?.layer?.id.endsWith("_geoserver_link"),
          ) ||
          queriedFeatures?.find((feature) =>
            rootGetters["map/clickableDatasetsIds"].some((id) =>
              feature.layer.id.startsWith(id),
            ),
          ),
        point,
      });
      dispatch("setGraphData");
    },
    async setGraphData({ rootGetters, getters, commit }) {
      const graphFeature = getters.graphFeature;
      if (!graphFeature?.lng || !graphFeature?.lat || !graphFeature?.dataset)
        return;
      const { lng, lat, dataset } = graphFeature;
      const coords = { lng, lat };
      const currentDataset = rootGetters["datasets/activeDatasets"].find(
        ({ id }) => id === dataset,
      );
      if (!currentDataset) return;
      const activeProps = rootGetters["datasets/activeDatasetValues"](dataset);
      const graphType = getGraphType(currentDataset);
      const layerType = getLayerType(graphFeature?.features?.layer);
      if (layerType === "clickable" && graphFeature?.features) {
        const properties =
          rootGetters["datasets/activeDatasetProperties"](dataset);

        const data = getGraphTypeData({
          datasetId: dataset,
          feature: graphFeature?.features.properties,
          values: activeProps,
          properties,
          coords,
          graphType,
        });
        if (!data.values?.length) {
          commit("EMPTY_GRAPH_DATA");
          commit("ADD_GRAPH_FEATURE");
          return;
        }
        commit("ADD_GRAPH_DATA", data);
      }
      if (layerType === "geojson" && graphFeature?.features) {
        if (!currentDataset?.assets?.data?.roles?.includes("zarr-root"))
          console.error("Mapbox data not implemented yet");
        try {
          const graphData = await getZarrData(
            currentDataset,
            graphFeature?.features,
            activeProps,
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
            rootGetters["datasets/activeDatasetProperties"](dataset),
          );
          if (!graphData?.values?.[0]?.data?.[0] && !graphData.series.length) {
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
          toast.error(
            "Error getting raster data, you may have selected an area that is not covered by the dataset.",
          );
          commit("EMPTY_GRAPH_DATA");
          commit("ADD_GRAPH_FEATURE");
        }
      }
    },
  },
};
