import { buildRasterMapboxLayer, getResourceLayers } from "@/lib/layers";
import getCatalog from "@/lib/request/get-catalog";

export default {
  namespaced: true,
  state: {
    mapboxLayers: [], //wmsLayers state have the format that is needed to add the layers on the map
    seaLevelRiseData: {},
    clickableDatasetsIds: [], // Not all layers are clickable. Only the ones in user stories.
    highlightedId: "",
    ceed_lau: "",
    ceed_bounds: null,
  },
  getters: {
    ceed_bounds: (state) => state.ceed_bounds,
    ceed_lau: (state) => state.ceed_lau,
    highlightedId: (state) => state.highlightedId,
    mapboxLayers(state) {
      return state.mapboxLayers;
    },
    seaLevelRiseData(state) {
      return state.seaLevelRiseData;
    },
    activeClickableDataset(state, _, __, rootGetters) {
      return rootGetters["datasets/dataset"](state.clickableDatasetsIds[0]);
    },
    clickableDatasetsIds(state) {
      return state.clickableDatasetsIds;
    },
  },
  mutations: {
    SET_CEED_BOUNDS(state, bounds) {
      state.ceed_bounds = bounds;
    },
    SET_CEED_LAU(state, lau) {
      state.ceed_lau = lau;
    },
    SET_HIGHLIGHTED_ID(state, id) {
      state.highlightedId = id;
    },
    ADD_MAPBOX_LAYER(state, mapboxLayer) {
      state.mapboxLayers = [...state.mapboxLayers, mapboxLayer];
    },
    ADD_CLICKABLE_LAYER(state, id) {
      state.clickableDatasetsIds = [...state.clickableDatasetsIds, id];
    },
    REMOVE_CLICKABLE_LAYER(state, id) {
      state.clickableDatasetsIds = [
        ...state.clickableDatasetsIds.filter((datasetId) => datasetId !== id),
      ];
    },
    REMOVE_MAPBOX_LAYER(state, id) {
      state.mapboxLayers = [
        ...state.mapboxLayers.filter(
          (mapboxLayer) => !mapboxLayer.id.startsWith(id),
        ),
      ];
    },
    SET_SEA_LEVEL_RISE_DATA(state, data) {
      state.seaLevelRiseData = data;
    },
  },
  actions: {
    async setSeedLau({ commit, dispatch, rootGetters }, ceed_lau) {
      commit("SET_CEED_LAU", ceed_lau);
      const collection = rootGetters["datasets/activeDatasets"].find(
        ({ id }) => id === "ceed_maps",
      );
      const link = collection.links.find((link) =>
        link.href.endsWith(`${ceed_lau}.json`),
      );
      const item = {
        ...(await getCatalog(encodeURI(link.href))),
        id: collection.id,
      };
      const layer = buildRasterMapboxLayer(item, "visual", { ceed_lau });
      commit("REMOVE_MAPBOX_LAYER", "ceed_maps_visual");
      dispatch("addMapboxLayer", layer);
      commit("SET_CEED_BOUNDS", item.bbox);
    },
    setHighlightedId({ commit }, id) {
      commit("SET_HIGHLIGHTED_ID", id || "");
    },
    addMapboxLayer({ commit }, mapboxLayer) {
      commit("ADD_MAPBOX_LAYER", mapboxLayer);
    },
    removeMapboxLayer({ commit }, id) {
      commit("REMOVE_MAPBOX_LAYER", id);
      commit("REMOVE_MAPBOX_LAYER", `${id}_visual`);
      commit("REMOVE_MAPBOX_LAYER", `${id}_mapbox`);
      commit("REMOVE_MAPBOX_LAYER", `${id}_geoserver_link`);
      commit("REMOVE_CLICKABLE_LAYER", id);
    },
    async loadDatasetOnMap({ commit, dispatch, rootGetters, state }, id) {
      if (!rootGetters["datasets/isActiveDataset"](id)) return;
      const dataset =
        id === "ceed_maps"
          ? rootGetters["datasets/dataset"]("LAU_CM")
          : rootGetters["datasets/dataset"](id);
      const properties = rootGetters["datasets/activeDatasetValues"](id);
      let layers = await getResourceLayers(dataset, properties);
      if (id === "ceed_maps") {
        layers = layers.map((layer) => ({
          ...layer,
          id: layer.id.replace("LAU_CM_visual_", "ceed_maps_geoserver_link"),
        }));
      }
      if (
        !state.clickableDatasetsIds.includes(id) &&
        (!dataset?.keywords?.includes("Background Layers") || id === "ceed_maps") &&
        id !== "cet"
      ) {
        commit("ADD_CLICKABLE_LAYER", id);
      }
      if (layers) {
        commit("REMOVE_MAPBOX_LAYER", dataset.id);
        layers.forEach((layer) => {
          dispatch("addMapboxLayer", layer);
        });
      }
    },
    setSeaLevelRiseData({ commit }, graph) {
      commit("SET_SEA_LEVEL_RISE_DATA", graph);
    },
  },
};
