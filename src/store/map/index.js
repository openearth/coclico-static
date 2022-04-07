import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import _ from 'lodash'
import themes from './themes.js'

export default {
  modules: {
    datasets,
    themes
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
				const themes = _.get(datasets, 'summaries.keywords') 
        themes.forEach(theme => commit('addTheme', theme))
				const children = datasets.links.filter(ds => ds.rel === 'child')
        
        return children.forEach(child => {
          return getCatalog(child.href) 
            .then(dataset => {
              //All the below functionality will be added in a function at the end
              const summaries = _.get(dataset, 'summaries')
              const mappedSummaries = Object.keys(summaries).map(id => {
                const summary = _.get(summaries, id)
                return {
                  id: id,
                  allowedValues: summary,
                  chosenValue: summary[0]
                }
              })
              _.set(dataset, 'summaries', mappedSummaries)
              
              commit('addDataset', dataset)
            })
        })
      })
    },
    loadMapboxLayer({commit}, layer) {
      console.log('layer that is passes in loadMapboxLayer', layer)
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
