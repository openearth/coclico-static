import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'

export default {
  modules: {
    datasets,
  },
  state: () => ({
    activeMapboxLayers: null // TODO: list of layers ready to be added.
  }),
 
  getters: {
    availableDatasets(state) {
      return state.datasets
    },
    activeMapboxLayers(state) {
      return state.activeMapboxLayers 
    }
  },
  actions: {
    loadDatasets ({commit}) {
			//Get STAC collection
    getCatalog(process.env.VUE_APP_CATALOG_URL)
      .then(datasets => {
				//const themes = _.get(datasets, 'summaries.keywords') //TODO: At this point no themes are used. Placeholder for the future
				const children = datasets.links.filter(ds => ds.rel === 'child')
        return children.forEach(child => {
          return getCatalog(child.href) 
            .then(dataset => {
              commit('addDataset', dataset)
            })
        })
      })
    },
    loadMapboxLayer({commit}, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href) 
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    }
  },
  mutations: {
    addMapboxLayer(state, mapboxLayer) {
      //TODO: allow multiple layers to loaded on the map from different collections. Allow only one layer from each collection?
      state.activeMapboxLayers  = mapboxLayer
    }
  },
}
