import { getResourceLayers } from "@/lib/layers";

export default {
  namespaced: true,
  state: {
    mapboxLayers: [], //wmsLayers state have the format that is needed to add the layers on the map
    seaLevelRiseData: {},
    clickableDatasetsIds: [], // Not all layers are clickable. Only the ones in user stories.
  },
  getters: {
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
      const dataset = rootGetters["datasets/dataset"](id);
      const properties = rootGetters["datasets/activeDatasetValues"](id);
      const layers = await getResourceLayers(dataset, properties);
      if (
        !state.clickableDatasetsIds.includes(id) &&
        !dataset?.keywords?.includes("Background Layers")
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
