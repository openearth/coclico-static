import getCatalog from "@/lib/request/get-catalog";
import { getLayerType, getResourceLayers } from "@/lib/layers";
import { getCollections } from "@/lib/catalog";

export default {
  namespaced: true,
  state: {
    themes: [],
    datasets: [],
    activeTheme: null,
    activeDatasetIds: [],
    mapboxSources: [],
    mapboxLayers: [], //wmsLayers state have the format that is needed to add the layers on the map
    seaLevelRiseData: {},
    clickableDatasetsIds: [], // Not all layers are clickable. Only the ones in user stories.
    properties: [],
  },
  getters: {
    themes(state) {
      return state.themes;
    },
    activeTheme(state) {
      return state.activeTheme;
    },
    datasetsInActiveTheme(state) {
      if (!state.activeTheme) {
        return state.datasets;
      }
      return state.datasets.filter((dataset) =>
        dataset?.keywords?.includes(state.activeTheme)
      );
    },
    activeDatasets(state) {
      return state.activeDatasetIds.map((id) => {
        return state.datasets.find((dataset) => dataset.id === id);
      });
    },
    activeDatasetIds(state) {
      return state.activeDatasetIds;
    },
    mapboxLayers(state) {
      return state.mapboxLayers;
    },
    mapboxSources(state) {
      return state.mapboxSources;
    },
    seaLevelRiseData(state) {
      return state.seaLevelRiseData;
    },
    activeClickableDataset(state) {
      return state.datasets.find((dataset) =>
        state.clickableDatasetsIds.includes(dataset.id)
      );
    },
    activeDatasetProperties(state) {
      return (id) =>
        state.properties.find(({ id: datasetId }) => datasetId === id)
          ?.properties;
    },
    activeDatasetValues(state) {
      return (id) =>
        Object.fromEntries(
          state.properties
            .find(({ id: datasetId }) => datasetId === id)
            .properties.map((property) => {
              return [property.id, property.value];
            })
        );
    },
  },
  mutations: {
    ADD_THEME(state, themeObject) {
      state.themes = [...state.themes, themeObject];
    },
    //Add or remove number of selected datasets of the theme.
    UPDATE_NUMBER_OF_ACTIVE_DATASETS_ON_THEME(state, { name, count }) {
      state.themes = state.themes.map((themeObject) => {
        if (themeObject.name === name) {
          return { ...themeObject, count: count };
        } else {
          return themeObject;
        }
      });
    },
    ADD_DATASET(state, dataset) {
      state.datasets = [...state.datasets, dataset];
    },
    ADD_DATASET_PROPERTIES(state, payload) {
      state.properties = [
        ...state.properties.filter(({ id }) => id !== payload.id),
        {
          id: payload.id,
          properties: payload.properties.map((property) => ({
            ...property,
            value: property.values[0],
          })),
        },
      ];
    },
    UPDATE_DATASET_PROPERTIES(state, { id, properties }) {
      const index = state.properties.findIndex((prop) => prop.id === id);
      state.properties[index] = { id, properties };
    },
    REMOVE_DATASET_PROPERTIES(state, id) {
      state.properties = [...state.properties.filter((prop) => prop.id !== id)];
    },
    SET_ACTIVE_THEME(state, theme) {
      state.activeTheme = theme;
    },
    ADD_ACTIVE_DATASET(state, id) {
      state.activeDatasetIds = Array.from(
        new Set([id, ...state.activeDatasetIds])
      );
    },
    REMOVE_ACTIVE_DATASET(state, id) {
      state.activeDatasetIds = state.activeDatasetIds.filter(
        (activeDatasetId) => activeDatasetId !== id
      );
    },
    ADD_MAPBOX_LAYER(state, mapboxLayer) {
      const layerType = getLayerType(mapboxLayer);
      if (layerType !== "clickable") {
        state.mapboxLayers = [...state.mapboxLayers, mapboxLayer];
      }
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
      state.mapboxLayers = state.mapboxLayers.filter(
        (mapboxLayer) => !mapboxLayer.id.startsWith(id)
      );
    },
    ADD_MAPBOX_SOURCE(state, mapboxSource) {
      state.mapboxSources = [...state.mapboxSources, mapboxSource];
    },
    REMOVE_MAPBOX_SOURCE(state, id) {
      state.mapboxSources = state.mapboxSources.filter(
        (mapboxSource) => mapboxSource.id !== id
      );
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
    },
    addMapboxSource({ commit }, mapboxSource) {
      commit("ADD_MAPBOX_SOURCE", mapboxSource);
    },
    removeMapboxSource({ commit }, id) {
      commit("REMOVE_MAPBOX_SOURCE", id);
    },
    async loadDatasets({ commit }) {
      const catalog = await getCatalog(process.env.VUE_APP_CATALOG_URL);
      catalog?.summaries?.keywords.forEach((keyword) =>
        commit("ADD_THEME", { name: keyword, count: 0 })
      );
      const collections = await getCollections(catalog);
      collections.forEach((collection) => commit("ADD_DATASET", collection));
    },
    setActiveTheme({ commit }, theme) {
      commit("SET_ACTIVE_THEME", theme);
    },
    updateThemeObject({ commit, getters }) {
      const countActiveDatasets = getters.datasetsInActiveTheme.filter(
        (dataset) => dataset.active === true
      ).length;
      commit("UPDATE_NUMBER_OF_ACTIVE_DATASETS_ON_THEME", {
        name: getters.activeTheme,
        count: countActiveDatasets,
      });
    },
    updateDatasetProperty(
      { getters, commit, dispatch },
      { dataset, property, value }
    ) {
      const properties = JSON.parse(
        JSON.stringify(getters.activeDatasetProperties(dataset))
      ).map((prop) => (prop.id === property ? { ...prop, value } : prop));
      commit("UPDATE_DATASET_PROPERTIES", { id: dataset, properties });
      dispatch("loadDatasetOnMap", dataset);
    },
    async loadDatasetOnMap({ commit, getters, state }, id) {
      const dataset = state.datasets.find((dataset) => dataset.id === id);
      const properties = getters.activeDatasetValues(id);
      const layers = await getResourceLayers(dataset, properties);
      if (!state.clickableDatasetsIds.includes(id)) {
        commit("ADD_CLICKABLE_LAYER", id);
      }
      if (layers) {
        commit("REMOVE_MAPBOX_LAYER", dataset.id);
        layers.forEach((layer) => {
          commit("ADD_MAPBOX_LAYER", layer);
        });
      }
    },
    addActiveDataset({ state, commit, dispatch }, id) {
      const dataset = state.datasets.find((dataset) => dataset.id === id);
      const properties = dataset.summaries;
      commit("ADD_ACTIVE_DATASET", id);
      commit("ADD_DATASET_PROPERTIES", { id, properties });
      dispatch("loadDatasetOnMap", id);
    },
    removeActiveDataset({ commit }, id) {
      commit("REMOVE_ACTIVE_DATASET", id);
      commit("REMOVE_MAPBOX_LAYER", id);
      commit("REMOVE_MAPBOX_LAYER", `${id}_visual`);
      commit("REMOVE_MAPBOX_LAYER", `${id}_mapbox`);
      commit("REMOVE_MAPBOX_LAYER", `${id}_geoserver_link`);
      commit("REMOVE_CLICKABLE_LAYER", id);
      commit("REMOVE_DATASET_PROPERTIES", id);
    },
    toggleActiveDataset({ state, dispatch }, id) {
      const datasetExist = state.activeDatasetIds.some(
        (activeId) => activeId === id
      );
      if (datasetExist) {
        dispatch("removeActiveDataset", id);
      } else {
        dispatch("addActiveDataset", id);
      }
    },
    setSeaLevelRiseData({ commit }, graph) {
      commit("SET_SEA_LEVEL_RISE_DATA", graph);
    },
  },
};
