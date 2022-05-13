import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import isArray from 'lodash/isArray'
import _ from 'lodash'
import themes from './themes.js'
import {active} from 'sortablejs'

export default {
  modules: {
    datasets,
    themes
  },
  state: () => ({
    activeMapboxLayers: null, // TODO: list of layers ready to be added.
    activeDatasetIds: [],
  
  }),
 
  getters: {
    availableDatasets(state) {
      return state.datasets
    },
    activeMapboxLayers(state) {
      return state.activeMapboxLayers 
    },
    activeDatasetIds(state) {
      return state.activeDatasetIds
    }
  },
  actions: {
    //get datasets from StacCatalogue
    loadDatasets ({state, commit, dispatch}) {
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
              //if we start a subroute with active dataset ids, directly load the layer
              if (state.activeDatasetIds.includes(dataset.id)) {
                _.set(state.datasets, `${dataset.id}.visible`, true)
                dispatch('loadLocationDataset', dataset)
              }
            })
        })
        
      })      
    },
    //builds format for mapbox 
    loadMapboxLayer({commit}, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href) 
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    },
 
    storeActiveDatasetIds ({ commit }, _ids) {
      // First set of the activeDatasetIds
      const ids = isArray(_ids) ? _ids : _ids.split(',')
      commit('setActiveDatasetIds', ids)
    },
    clearActiveDatasetIds({commit}) {
      commit('clearActiveDatasetIds')
    },
    //
    loadLocationDataset({dispatch}, dataset) {
      const {links,  summaries } = dataset
      const filterByProperty = ({properties})=> {
        if (properties) {
          const array =  summaries.map(({id, chosenValue }) => {
            const propVal = _.get(properties, id)
          return propVal === chosenValue
        })
        return array.every(Boolean)
      }
      }
      const layer = links.find(filterByProperty)

      if (!layer) {
          return
      }
      dispatch('loadMapboxLayer',layer)  
    }

  },
  mutations: {
    addMapboxLayer(state, mapboxLayer) {
      //TODO: allow multiple layers to loaded on the map from different collections. Allow only one layer from each collection?
      state.activeMapboxLayers  = mapboxLayer
    },
    setActiveDatasetIds (state, ids) {
      state.activeDatasetIds = ids
    },
    clearActiveDatasetIds (state) {
      state.activeDatasetIds = []
    },
  },
}
