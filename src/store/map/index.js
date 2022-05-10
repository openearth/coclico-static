import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import _ from 'lodash'
import themes from './themes.js'
import { openArray } from 'zarr'

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
    loadMapboxLayer({ commit }, layer) {
      //get info of the layer from stac catalog
      getCatalog(layer.href)
        .then(layerInfo => {
          commit('addMapboxLayer', buildGeojsonLayer(layerInfo))
        })
    },
    loadPointDataForLocation({ state, commit }) {
      // TODO: we need a state for clicked dataset (preferrably within the router)
      const dataset = _.get(state, 'datasets.deltares-coclico-ssl')
      console.log(dataset)
      // const url = _.get(dataset, 'assets.data.href')
      const url = 'https://storage.googleapis.com/dgds-data-public/coclico/CoastAlRisk_Europe_EESSL.zarr'
      const path = Object.keys(dataset['cube:variables'])[0]
      console.log(path)
      // const dimensions = _.get(dataset, `cube:variables[${path}].dimensions`)

      // console.log(dataset, url)

      openArray({
        store: url,
        path: path,
        mode: 'r'
      })
        .then(res => {
          console.log(res)
          res.get([ 0, 0, 0, null, null ]).then(data => {
            const series = [ 0, 1, 2 ].map(p => {
              return data.data.map(d => d[p])
            })
            console.log(series)
            // commit('addDatasetPointData', {
            //   id: datasetId,
            //   data: {
            //     [locationId]: {
            //       type: 'multiple',
            //       serie: series,
            //       category: Array.from(Array(data.data.length).keys())
            //     }
            //   }
            // })
          })
        })
    }
  },
  mutations: {
    addMapboxLayer(state, mapboxLayer) {
      //TODO: allow multiple layers to loaded on the map from different collections. Allow only one layer from each collection?
      state.activeMapboxLayers = mapboxLayer
    }
  },
}
