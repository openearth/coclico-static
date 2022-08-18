import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import buildRasterLayer from '@/lib/mapbox/build-raster-layer'
import matchLayerIdToProperties from '@/lib/match-layer-id-to-properties.js'
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
    activeLocationLayer: null,
    selectedVectorData: {},
    activeDatasetIds: [],
    activeRasterLayer: null,
    activeDatasetId: null, //introduced only temporarily. To be removed when the dataset share the same location ids
  }),

  getters: {
    availableDatasets(state) {
      return state.datasets
    },
    selectedDatasets(state) {
      return state.activeDatasetIds.map(datasetId => {
        return _.get(state.selectedVectorData, `data.${datasetId}`)
      })
    },
    //active location layer on map
    activeLocationLayer(state) {
    return state.activeLocationLayer
    },
    activeRasterLayer(state) {
      return state.activeRasterLayer
    },
    selectedVectorData(state) {
      return state.selectedvectorData
    },
    activeDatasetIds(state) {
      return state.activeDatasetIds
    },
    activeDatasetId(state) {
      return state.activeDatasetId
    },
    activeVariableId(state) {
      return state.activeVariableId
    },
  },
  mutations: {
    setActiveLocationLayer(state, layer) {
      state.activeLocationLayer = layer
    },
    resetActiveLocationLayer(state) {
      state.activeLocationLayer = null
    },
    setActiveRasterLayer(state, layer) {
      state.activeRasterLayer = layer
    },
    resetActiveRasterLayer(state, layer) {
      state.activeRasterLayer = null
    },
    setSelectedVectorData(state, vectorData) {
      state.selectedVectorData = vectorData
    },
    addDatasetPointData(state, vectorData) {
      Vue.set(state.selectedVectorData, `data.${vectorData.id}`, vectorData)
    },
    setActiveDatasetIds (state, ids) {
      //at this moment only one location dataset is allowed to be displayed.
      //in the future more than one id will be stored in this state.
      state.activeDatasetIds = ids
    },
    clearActiveDatasetIds (state) {
      state.activeDatasetIds = []
    },
    setActiveDatasetId(state, id) {
      state.activeDatasetId = id
    },
    clearActiveVariableId (state) {
      state.activeVariableId = null
    },
    setActiveVariableId(state, variable) {
      state.activeVariableId = variable
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

              // Store available data variables
              const variables = _.get(dataset, 'cube:variables')
              var mappedVariables = Object.keys(variables).map(id => {
                const variable = _.get(variables, id)
                if (variable.type === 'data') {
                  return {
                    id: id
                  }
                }
              })

              mappedVariables = _.compact(mappedVariables)

              const mappedVariablesArray = mappedVariables.map(a => a.id)
              if (mappedVariablesArray.length !== 0) {
                _.set(dataset, 'variables', mappedVariablesArray)
              }

              commit('addDataset', dataset)
              //if we start a subroute with active dataset ids, directly load the layer
              if (state.activeDatasetIds.includes(dataset.id)) {
                dispatch('setActiveDatasetId', dataset.id)
                dispatch('loadLocationDataset', dataset)
                dispatch('loadPointDataForLocation')
                dispatch('setActiveVariableId', dataset.variables[0])
              }
            })
        })

      })
    },

    reclassifyMapboxLayer({state, commit}, dataset) {
      /*
      This implementation is only checked with paint that has the below format
       "circle-color": [
                "interpolate",
                [
                    "linear"
                ],
                [
                    "get",
                    "scenario-Historical-RP-10.0"
                ],
                -1,
                "hsl(0, 90%, 80%)",
                0,
                "hsla(55, 88%, 53%, 0.15)",
                1,
                "hsl(110, 90%, 80%)"
            ],
      */
      const newMin = _.get(dataset, 'deltares:min', '')
      const newMax =  _.get(dataset, 'deltares:max', '')

      const mapboxLayer = state.activeLocationLayer
      const mapboxLayerId = _.get(mapboxLayer, 'id')
      const circleColors = _.get(mapboxLayer, 'paint.circle-color')
      //remove mapboxlayer in order and update paint
      //
      commit('resetActiveLocationLayer')
      //create new colors

      const newCircleColors = circleColors.map((item, index) => {
        //index is based on the format of
        if (index === 3) {
          return parseFloat(newMin)
        }
        if (index === 5) {
          return  ((parseFloat(newMin)+parseFloat(newMax))/2.0)
        }
        if (index === 7) {
          return parseFloat(newMax)
        }
        return item
      })

      _.set(mapboxLayer, 'paint.circle-color', newCircleColors)
      //add layer again in the activeMapboxLayers array
      commit('setActiveLocationLayer', mapboxLayer)

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
      // const datasetName = "replace"
      const datasetName = _.get(dataset, 'name')

      // check which variable is of "data" type, and set path to this
      const variables = Object.entries(_.get(dataset, 'cube:variables'))
      let path = variables.map(dim => {
        if (dim[1].type === 'data') {
          return dim[0]
        } else {
          return null
        }
      })
      // filter out null dimensions in path (should be better way to do this?)
      path = path.filter(x=>x)[0]

      const dimensions = Object.entries(_.get(dataset, `["cube:variables"].${path}.dimensions`))
      const variableUnit = Object.entries(_.get(dataset, `["cube:variables"].${path}.unit`))
      let slice = dimensions.map(dim => {
        // TODO: make sure that the stations always correspond to the mapbox layers and that the
        // other layers are the temporal layers used in the graphs..
        if (dim[1] === 'stations') {
          return _.get(state.selectedVectorData, 'properties.locationId', 0)
        } else {
          return null
        }
      })
      console.log('url', url)
      console.log('path', path)
      console.log('slice', slice)

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
            console.log('series', series)
            // TODO: Which axis belongs to which dimension????
            let cubeDimensions = _.get(dataset, 'cube:dimensions')
            // cubeDimensions = cubeDimensions.filter(dim => dim.type === 'temporal')
            const xAxis = Object.keys(cubeDimensions)[2]
            const yAxis = variableUnit[0][1]
            // Name based on deltares:plotSeries from STAC
            const plotSeries = _.get(dataset, 'deltares:plotSeries')
            const dimensionNames = Object.entries(_.get(dataset, `["cube:dimensions"].${plotSeries}.values`))

            for (var i = 0; i < dimensionNames.length; i++) {
              series[i].name = dimensionNames[i][1]
            }
            commit('addDatasetPointData', {
              id: datasetId,
              name: datasetName,
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
    storeactiveDatasetIds ({ commit }, _ids) {
      // First set of the activeDatasetIds
      const ids = isArray(_ids) ? _ids : _ids.split(',')
      commit('setActiveDatasetIds', ids)
    },
    clearActiveDatasetIds({commit}) {
      commit('clearActiveDatasetIds')
    },
    clearActiveVariableId({commit}) {
      commit('clearActiveVariableId')
    },
    loadLocationDataset({state, commit}, dataset) {
      const layer = matchLayerIdToProperties(dataset)
      //get info of the layer from stac catalog
      const activeVariableId = state.activeVariableId
      if (typeof activeVariableId !== 'undefined' && activeVariableId !== null) {
        layer.href = layer.href.replaceAll([ dataset.variables[0] + '-mapbox' ], [ activeVariableId + '-mapbox' ])
      }
      getCatalog(layer.href)
        .then(layerInfo => {
          commit('setActiveLocationLayer', buildGeojsonLayer(layerInfo))
        })   
    },
    loadRasterDataset({commit}, dataset) {
      const layer = matchLayerIdToProperties(dataset)
      getCatalog(layer.href)
        .then(layerInfo => {
          commit('setActiveRasterLayer', buildRasterLayer(layerInfo))
        })   
    },
    resetActiveLocationLayer({commit}) {
      commit('resetActiveLocationLayer')
    },
    resetActiveRasterLayer({commit}) {
      commit('resetActiveRasterLayer')
    },
    setActiveDatasetId({commit}, id) {
      commit('setActiveDatasetId', id)
    },
    setActiveVariableId({commit}, variable) {
      commit('setActiveVariableId', variable)
    }
  },
}

