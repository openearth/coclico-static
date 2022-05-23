import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import isArray from 'lodash/isArray'
import _ from 'lodash'
import themes from './themes.js'

export default {
  modules: {
    datasets,
    themes
  },
  state: () => ({
    activeMapboxLayers: [],
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
    //commits the  building the mapbox layer format
    loadMapboxLayer({commit}, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href) 
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    },

    reclassifyMapboxLayer({state, commit}, dataset) {
      
      const newMin = _.get(dataset, 'properties.deltares:min', '')
      const newMax =  _.get(dataset, 'properties.deltares:max', '')
      const datasetId = _.get(dataset, 'id')
      
      
      const mapboxLayer = state.activeMapboxLayers.find(({id}) => id.includes(datasetId))
      const mapboxLayerId = _.get(mapboxLayer, 'id')
      const circleColors = _.get(mapboxLayer, 'paint.circle-color')
      //remove mapboxlayer in order to re-add it with the new colors
      commit('removeMapboxLayer',mapboxLayerId)
      //create new colors
      const newCircleColors = circleColors.map((item, index) => {
        
        if (index === 3) {
          return parseFloat(newMin)
        }
        if (index === 5) {
          return  parseFloat((newMin+newMax)/2) 
        }

        if (index === 7) {
          return parseFloat(newMax)
        }
        return item
      })

      _.set(mapboxLayer, 'paint.circle-color', newCircleColors)
      //add layer again in the activeMapboxLayers array
      commit('addMapboxLayer', mapboxLayer)

    },
 
    storeActiveDatasetIds ({ commit }, _ids) {
      // First set of the activeDatasetIds
      const ids = isArray(_ids) ? _ids : _ids.split(',')
      commit('setActiveDatasetIds', ids)
    },
    clearActiveDatasetIds({commit}) {
      commit('clearActiveDatasetIds')
    }

  },
  mutations: {
    addMapboxLayer(state, mapboxLayer) {
      const layerExists = state.activeMapboxLayers.some(storedLayer => storedLayer.id === mapboxLayer.id);
      if (!layerExists) {
        state.activeMapboxLayers  =  state.activeMapboxLayers = [
          ...state.activeMapboxLayers, {
            ...mapboxLayer
          }
        ];
      }
    },
    removeMapboxLayer(state, mapboxLayerId) {
      state.activeMapboxLayers = state.activeMapboxLayers.filter(({id}) => id !== mapboxLayerId)
    },
    setActiveDatasetIds (state, ids) {
      state.activeDatasetIds = ids
    },
    clearActiveDatasetIds (state) {
      state.activeDatasetIds = []
    },
  },
}
