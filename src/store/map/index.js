
import _ from 'lodash'

import getCatalog from '@/lib/request/get-catalog'


export default {
  namespaced: true,

  state: () => ({
        testLayer: {
        "id": "EU_EESSL_JRC_Hist_RP_flat-74xh1t",
        "type": "circle",
        "source": {
          "url": "mapbox://global-data-viewer.6v63xk2e", 
          "type": "vector"
        },
      "source-layer": "EU_EESSL_JRC_Hist_RP_flat-74xh1t", 
      "paint": {

        "circle-radius": 5,
        "circle-stroke-color": "#1e1688",
        "circle-stroke-width": 1,
        "circle-color": [ 
              "interpolate",
                ["linear"],
                ["get", "rp_5"],
                0,
                "#00ff00",
                2,
                "#0000ff",
                3,
                "#ffff00",
                4,
                "#ff0000 "
              ],
        },
      }
  }),
  getters: {
  },
  actions: {
    loadDatasets ({ state, commit, dispatch }) {
    // Retrieve the first 2 layers of the stac collection, the general metadata
    // and the childs including all datasets
    getCatalog(process.env.VUE_APP_CATALOG_URL)
      .then(datasets => {
        // Add themes to store.themes
        const themes = _.get(datasets, 'summaries.keywords')
        themes.forEach(theme => commit('addTheme', theme))

        const childs = datasets.links.filter(ds => ds.rel === 'child')
        return childs.forEach(child => {
          commit('addDataset', { id: child.title })
          return getCatalog(child.href)
            .then(dataset => {
              commit('addDataset', dataset)
              // If we start at a subroute with active dataset ids, directly
              // load the vector layers
              if (state.activeDatasetIds.includes(dataset.id)) {
                _.set(state.datasets, `${dataset.id}.visible`, true)
                dispatch('loadVectorLayer', dataset)
                dispatch('triggerActiveVector')
              }
              if (dataset.id === state.activeRasterLayerId) {
                dispatch('loadActiveRasterData', dataset.id)
              }
            })
        })
      })
  },
  },
  mutations: {
  },
}
