import getCatalog from "@/lib/request/get-catalog";
import buildGeojsonMapboxLayer from "@/lib/mapbox/build-geojson-mapbox-layer";
import buildRasterMapboxLayer from "@/lib/mapbox/build-raster-mapbox-layer";
import matchLayerIdToProperties from "@/lib/match-layer-id-to-properties.js";

import _ from "lodash";

export default {
  namespaced: true,
  state: {
    themes: [],
    datasets: [],
    activeTheme: null,
    activeDatasets: [],
    mapboxLayers: [], //wmsLayers state have the format that is needed to add the layers on the map
    graphsInDashboard: [],
    seaLevelRiseData: {},
    activeClickableDataset: null,
    clickableDatasetsIds: ["cfhp", "slp", "ssl", "eesl", "sc", "cfr", "cbca"], // Not all layers are clickable. Only the ones in user stories.
    // perhaps we can provide that from the catalog.
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
      const filteredDatasets = state.datasets.filter((dataset) =>
        dataset?.keywords?.includes(state.activeTheme)
      );
      return filteredDatasets;
    },
    activeDatasets(state) {
      return state.activeDatasets;
    },
    mapboxLayers(state) {
      return state.mapboxLayers;
    },
    graphsInDashboard(state) {
      return state.graphsInDashboard;
    },
    seaLevelRiseData(state) {
      return state.seaLevelRiseData;
    },
    activeClickableDataset(state) {
      return state.activeClickableDataset;
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
    SET_ACTIVE_THEME(state, theme) {
      state.activeTheme = theme;
    },
    ADD_ACTIVE_DATASET(state, dataset) {
      state.activeDatasets = [...state.activeDatasets, dataset];
      // Set clickableDataset TODO: to be improved
      if (state.clickableDatasetsIds.includes(state.activeDatasets[0].id)) {
        state.activeClickableDataset = state.activeDatasets[0];
      }
    },
    REMOVE_ACTIVE_DATASET(state, id) {
      state.activeDatasets = state.activeDatasets.filter(
        (activeDataset) => activeDataset.id !== id
      );
      // Set clickableDataset
      if (state.activeDatasets.length === 0) {
        state.activeClickableDataset = null;
      } else {
        if (state.clickableDatasetsIds.includes(state.activeDatasets[0].id)) {
          state.activeClickableDataset = state.activeDatasets[0];
        }
      }
    },
    ADD_MAPBOX_LAYER(state, mapboxLayer) {
      state.mapboxLayers = [...state.mapboxLayers, mapboxLayer];
    },
    REMOVE_MAPBOX_LAYER(state, id) {
      state.mapboxLayers = state.mapboxLayers.filter(
        (mapboxLayer) => mapboxLayer.id !== id
      );
    },
    ADD_GRAPH_TO_DASHBOARD(state, graph) {
      state.graphsInDashboard.push(graph);
    },
    REMOVE_GRAPH_FROM_DASHBOARD(state, index) {
      state.graphsInDashboard.splice(index, 1);
    },
    SET_SEA_LEVEL_RISE_DATA(state, data) {
      state.seaLevelRiseData = data;
    },
  },
  actions: {
    loadDatasets({ commit }) {
      //Get STAC collection
      getCatalog(process.env.VUE_APP_CATALOG_URL)
        //1. first  we get the parent catalog
        .then((catalog) => {
          //2. read themes from the main catalog
          const keywords = _.get(catalog, "summaries.keywords");
          keywords.forEach((keyword) =>
            commit("ADD_THEME", { name: keyword, count: 0 })
          );
          //3. get collections of the catalog
          const collections = catalog.links.filter((el) => el.rel === "child");
          collections.forEach((collection) => {
            getCatalog(collection.href)
              //get collection information (let's name it dataset)
              .then((dataset) => {
                // 4. exlude dataset with id template
                if (dataset.id !== "template") {
                  // 4.a add allowedValues and chosenValue to the dataset
                  const summaries =
                    _.get(dataset, "summaries") || _.get(catalog, "summaries");
                  const mappedSummaries = Object.keys(summaries).map((id) => {
                    const summary = _.get(summaries, id);
                    return {
                      id: id,
                      allowedValues: summary,
                      chosenValue: summary[0],
                    };
                  });
                  _.set(dataset, "summaries", mappedSummaries);
                  // 4.b. add variables to the dataset
                  const variables = _.get(dataset, "cube:variables");

                  if (typeof variables !== "undefined") {
                    var mappedVariables = Object.keys(variables).map((id) => {
                      const variable = _.get(variables, id);
                      if (variable.type === "data") {
                        return {
                          id: id,
                        };
                      }
                    });
                    mappedVariables = _.compact(mappedVariables);

                    const mappedVariablesArray = mappedVariables.map(
                      (a) => a.id
                    );
                    if (mappedVariablesArray.length !== 0) {
                      _.set(dataset, "variables", mappedVariablesArray);
                    }
                  }
                  commit("ADD_DATASET", dataset);
                }
              });
          });
        });
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
    loadDatasetOnMap({ commit }, dataset) {
      const layer = matchLayerIdToProperties(dataset);
      if (!layer) {
        return;
      }
      //Check if the layer is vector or a raster
      const layerType = _.has(dataset, "cube:dimensions") ? "vector" : "raster";

      getCatalog(layer.href).then((layerInfo) => {
        console.log("layerInfo", layerInfo);
        layerInfo.id = dataset.id; // I will use the dataset id
        if (layerType === "vector") {
          commit("ADD_MAPBOX_LAYER", buildGeojsonMapboxLayer(layerInfo));
        } else {
          const rasterMapboxLayer = buildRasterMapboxLayer(layerInfo);
          commit("ADD_MAPBOX_LAYER", rasterMapboxLayer);
        }
      });
    },
    //Used when new selections have been made
    reloadDatasetOnMap({ commit, dispatch }, dataset) {
      commit("REMOVE_MAPBOX_LAYER", dataset.id);
      dispatch("loadDatasetOnMap", dataset);
    },
    updateActiveDatasetsArray({ state, commit, dispatch }, dataset) {
      const datasetExist = state.activeDatasets.find(
        (activeDataset) => activeDataset.id === dataset.id
      );
      if (datasetExist) {
        commit("REMOVE_ACTIVE_DATASET", dataset.id);
        commit("REMOVE_MAPBOX_LAYER", dataset.id);
      } else {
        commit("ADD_ACTIVE_DATASET", dataset);
        dispatch("loadDatasetOnMap", dataset);
      }
    },
    addGraphToDashboard({ commit }, graph) {
      commit("ADD_GRAPH_TO_DASHBOARD", graph);
    },
    removeGraphFromDashboard({ commit }, index) {
      commit("REMOVE_GRAPH_FROM_DASHBOARD", index);
    },
    setSeaLevelRiseData({ commit }, graph) {
      commit("SET_SEA_LEVEL_RISE_DATA", graph);
    },
  },
};
