import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import isArray from 'lodash/isArray'
import _ from 'lodash'
import themes, { state } from './themes.js'
import { openArray } from 'zarr'
import router from '@/router'
import Vue from 'vue'

export default {
  modules: {
    datasets,
    themes
  },
  state: () => ({
    activeMapboxLayers: null, // TODO: list of layers ready to be added.
    selectedPointData: {},
    activeDatasetIds: [],
  }),

  getters: {
    availableDatasets(state) {
      return state.datasets
    },
    selectedDatasets(state) {
      return state.activeDatasetIds.map(datasetId => {
        return _.get(state.selectedPointData, `data.${datasetId}`)
      })
    },
    activeMapboxLayers(state) {
    return state.activeMapboxLayers
    },
    selectedPointData(state) {
      return state.selectedPointData
    },
    activeDatasetIds(state) {
      return state.activeDatasetIds
    }
  },
  mutations: {
    addMapboxLayer(state, mapboxLayer) {
      //TODO: allow multiple layers to loaded on the map from different collections. Allow only one layer from each collection?
      state.activeMapboxLayers  = mapboxLayer
    },
    setSelectedPointData(state, pointData) {
      state.selectedPointData = pointData
    },
    addDatasetPointData(state, pointData) {
      Vue.set(state.selectedPointData, `data.${pointData.id}`, pointData)
    },
    setActiveDatasetIds (state, ids) {
      state.activeDatasetIds = ids
    },
    clearActiveDatasetIds (state) {
      state.activeDatasetIds = []
    },
  },
  actions: {
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
              // TODO: Extra Storm Surge Level is the template layer, filter this out!
              if (child.title === 'Extra Storm Surge Level') {
                return
              }
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
                dispatch('loadPointDataForLocation')
              }
            })
        })

      })
    },
    loadMapboxLayer({ commit }, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href)
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    },
    loadPointDataForLocation({ state, commit }) {
      // Retrieve per point data from a zarr file corresponding to the href in the
      // data attributes and it's dimensions and variables
      const datasetId = router.currentRoute.params.datasetIds
      const dataset = _.get(state.datasets, datasetId)
      if (!dataset) {
        return
      }
      const url = _.get(dataset, 'assets.data.href')
      const path = Object.keys(_.get(dataset, 'cube:variables'))[0]
      const dimensions = Object.entries(_.get(dataset, `["cube:variables"].${path}.dimensions`))
      const variableUnit = Object.entries(_.get(dataset, `["cube:variables"].${path}.unit`))
      let slice = dimensions.map(dim => {
        // TODO: make sure that the stations always correspond to the mapbox layers and that the
        // other layers are the temporal layers used in the graphs..
        if (dim[1] === 'stations') {
          return _.get(state.selectedPointData, 'properties.locationId', 0)
        } else {
          return null
        }
      })

      openArray({
        store: url,
        path: path,
        mode: 'r'
      })
        .then(res => {
          res.get(slice).then(data => {
            const series = data.data.map(serie => {
              return {
                type: 'line',
                data: Array.from(serie)
              }
            })

            // TODO: Which axis belongs to which dimension????
            let cubeDimensions = _.get(dataset, 'cube:dimensions')
            // cubeDimensions = cubeDimensions.filter(dim => dim.type === 'temporal')
            const xAxis = Object.keys(cubeDimensions)[2]
            const yAxis = variableUnit[0][1]
            for (var i = 0; i < cubeDimensions.scenario.values.length; i++) {
              series[i].name = cubeDimensions.scenario.values[i]
            }
            commit('addDatasetPointData', {
              id: datasetId,
              series,
              xAxis: {
                type: 'category',
                data: cubeDimensions[xAxis].values,
                title: `${xAxis}`
              },
              yAxis: {
                title: `${variableUnit[0][1]}`,
              }
            })
          })
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
  }
}
