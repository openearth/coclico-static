import getCatalog from "@/lib/request/get-catalog";
import { getCollections } from "@/lib/catalog";

export default {
  namespaced: true,
  state: {
    themes: [],
    datasets: [],
    activeTheme: null,
    activeDatasetIds: [],
    properties: [],
  },
  getters: {
    themes(state) {
      return state.themes;
    },
    dataset: (state) => (id) =>
      state.datasets.find((dataset) => dataset.id === id),
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
    properties: (state) => state.properties,
    isActiveDataset: (state) => (id) => state.activeDatasetIds.includes(id),
    activeDatasetProperties(state) {
      return (id) =>
        state.properties.find(({ id: datasetId }) => datasetId === id)
          ?.properties;
    },
    activeDatasetValues: (state) => (id) => {
      const propertyEntries = state.properties
        .find(({ id: datasetId }) => datasetId === id)
        ?.properties.map((property) => {
          return [property.id, property.value];
        });
      return propertyEntries ? Object.fromEntries(propertyEntries) : null;
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
      state.properties = [
        ...state.properties.slice(0, index),
        { id, properties },
        ...state.properties.slice(index + 1),
      ];
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
  },
  actions: {
    async loadDatasets({ commit }) {
      const catalog = await getCatalog(import.meta.env.VITE_CATALOG_URL);
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
    updateDatasetProperty({ getters, commit }, { dataset, property, value }) {
      const properties = getters
        .activeDatasetProperties(dataset)
        .map((prop) => (prop.id === property ? { ...prop, value } : prop));
      commit("UPDATE_DATASET_PROPERTIES", { id: dataset, properties });
    },
    addActiveDataset({ state, commit }, id) {
      const dataset = state.datasets.find((dataset) => dataset.id === id);
      const properties = dataset.summaries;
      commit("ADD_ACTIVE_DATASET", id);
      commit("ADD_DATASET_PROPERTIES", { id, properties });
    },
    removeActiveDataset({ commit, dispatch }, id) {
      commit("REMOVE_ACTIVE_DATASET", id);
      commit("REMOVE_DATASET_PROPERTIES", id);
      dispatch("map/removeMapboxLayer", id, { root: true });
    },
    toggleActiveDataset({ getters, dispatch }, id) {
      const datasetExist = getters.isActiveDataset(id);
      if (datasetExist) {
        dispatch("removeActiveDataset", id);
      } else {
        dispatch("addActiveDataset", id);
      }
    },
  },
};
