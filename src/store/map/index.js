import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import isArray from 'lodash/isArray'
import _ from 'lodash'
import themes, { state } from './themes.js'
import { openArray } from 'zarr'
import router from '@/router'

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
      console.log(pointData)
      state.selectedPointData.data = pointData
    },
    setActiveDatasetIds (state, ids) {
      state.activeDatasetIds = ids
    },
    clearActiveDatasetIds (state) {
      state.activeDatasetIds = []
    },
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
            // TODO: Extra Storm Surge Level is the template layer, filter this out!
            if (child.title === 'Extra Storm Surge Level') {
              return
            }
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
    loadMapboxLayer({ commit }, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href)
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    },
    loadPointDataForLocation({ state, commit }) {
      const datasetId = router.currentRoute.params.datasetIds
      // TODO: only works now with 1 param selected!!
      const dataset = _.get(state.datasets, datasetId)
      const url = _.get(dataset, 'assets.data.href')
      console.log(url)
      const path = Object.keys(dataset['cube:variables'])[0]
      console.log(path)

      const station = state.selectedPointData.properties.locationId

      fetch(`${url}/${path}/.zattrs`)
        .then(res => res.json())
        .then(res => {
          console.log(res, station)
          const dimensions = res._ARRAY_DIMENSIONS
          let slice = dimensions.map(dim => {
            if (dim === 'stations') {
              return station
            } else if (dim === 'scenarios') {
              return null
            } else {
              return null
            }
          })

          slice = [ null, station, null ]
          openArray({
            store: url,
            path: path,
            mode: 'r'
          })
            .then(res => {
              console.log(res)
              res.get(slice).then(data => {
                console.log(slice, data)
                const series = data.data.map(serie => {
                  return {
                    type: 'line',
                    data: Array.from(serie)
                  }
                })
                commit('addDatasetPointData', {
                  series,
                  category: _.get(dataset, '["cube:dimensions"].RP.values')
                })
              })
            })
        })
      // const dimensions = _.get(dataset, `cube:variables[${path}].dimensions`)

      // console.log(dataset, url)

    },
    storeActiveDatasetIds ({ commit }, _ids) {
      // First set of the activeDatasetIds
      const ids = isArray(_ids) ? _ids : _ids.split(',')
      commit('setActiveDatasetIds', ids)
    },
    clearActiveDatasetIds({commit}) {
      commit('clearActiveDatasetIds')
    }
  }
}
