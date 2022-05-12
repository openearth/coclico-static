import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import _ from 'lodash'
import themes, { state } from './themes.js'
import { openArray } from 'zarr'

export default {
  modules: {
    datasets,
    themes
  },
  state: () => ({
    activeMapboxLayers: null, // TODO: list of layers ready to be added.
    selectedPointData: {}
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
    }
  },
  mutations: {
    addMapboxLayer(state, mapboxLayer) {
      //TODO: allow multiple layers to loaded on the map from different collections. Allow only one layer from each collection?
      state.activeMapboxLayers = mapboxLayer
    },
    setSelectedPointData(state, pointData) {
      state.selectedPointData = pointData
    },
    addDatasetPointData(state, pointData) {
      console.log(pointData)
      state.selectedPointData.data = pointData
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
    loadMapboxLayer({ commit }, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href)
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    },
    loadPointDataForLocation({ state, commit }) {
      const datasetId = 'deltares-coclico-ssl'
      // TODO: we need a state for clicked dataset (preferrably within the router)
      const dataset = _.get(state.datasets, datasetId)
      console.log(dataset)
      let url = _.get(dataset, 'assets.data.href')
      console.log(url)
      url = 'https://storage.googleapis.com/dgds-data-public/coclico/CoastAlRisk_Europe_EESSL.zarr'
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

          slice = [null, station, null]
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

    }
  }
}
