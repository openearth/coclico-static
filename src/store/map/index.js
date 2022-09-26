import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import buildRasterLayer from '@/lib/mapbox/build-raster-layer'
import matchLayerIdToProperties from '@/lib/match-layer-id-to-properties.js'
import isArray from 'lodash/isArray'
import _ from 'lodash'
import themes from './themes.js'
import { openArray } from 'zarr'
import router from '@/router'
import Vue from 'vue'
import { path } from 'lodash/fp.js'

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
    lockedDatasets: [],
    activeSummary: [],
    activeVariableId: null
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
      return state.selectedVectorData
    },
    activeDatasetIds(state) {
      return state.activeDatasetIds
    },
    activeDatasetId(state) {
      return state.activeDatasetId
    },
    lockedDatasets(state) {
      return state.lockedDatasets
    },
    activeVariableId(state) {
      return state.activeVariableId
    },
    activeSummary (state) {
      return state.activeSummary
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
    resetActiveRasterLayer(state) {
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
    lockDataset(state, dataset) {
      state.lockedDatasets.push(dataset)
    },
    removeLockedDataset(state, id) {
      state.lockedDatasets = state.lockedDatasets.filter(data => data.id !== id)
    },
    clearActiveVariableId (state) {
      state.activeVariableId = null
    },
    setActiveVariableId(state, variable) {
      state.activeVariableId = variable
    },
    setActiveSummary (state, summary) {
      Vue.set(state, 'activeSummary', summary)
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
              // Exclude template folder from selection (check with backend whether this should stay in STAC catalog)
              if (dataset.id !== 'template') {

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
                if (typeof variables !== 'undefined') {
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
                }
                commit('addDataset', dataset)
                //if we start a subroute with active dataset ids, directly load the layer
                if (state.activeDatasetIds.includes(dataset.id)) {
                  dispatch('setActiveDatasetId', dataset.id)
                  dispatch('loadLocationDataset', dataset)
                  dispatch('loadPointDataForLocation')
                  dispatch('setActiveVariableId', dataset.variables[0])
                }
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
      const datasetName = _.get(dataset, 'id')

      // check which variable is of "data" type, and set path to this
      const variables = Object.entries(_.get(dataset, 'cube:variables'))
      let path = []
      variables.forEach(dim => {
        if (dim[1].type === 'data') {
          // Look for dimension which corresponds to selected variable
          // for bar plots, all variables should be read. For line and area plot, only one variable should be read
          if (_.get(dataset, 'deltares:plotType') !== 'bar') {
            if (dim[0] === state.activeVariableId) {
              path.push(dim[0])
            }
          } else if (_.get(dataset, 'deltares:plotType') === 'bar') {
            path.push(dim[0])
          }
        }
      })

      // filter out null dimensions in path (should be better way to do this?)
      // for bar plots, all variables should be read. For line and area plot, only one variable should be read
      var dimensions = []
      if (_.get(dataset, 'deltares:plotType') !== 'bar') {
        path = path.filter(x=>x)[0]
        dimensions = Object.entries(_.get(dataset, `["cube:variables"].${path}.dimensions`))
      } else if (_.get(dataset, 'deltares:plotType') === 'bar') {
        dimensions = Object.entries(_.get(dataset, `["cube:variables"].${path[0]}.dimensions`))
      }

      const summaryList = _.get(state, 'activeSummary')

      let slice = dimensions.map(dim => {
        if (dim[1] === 'stations') {
          return _.get(state.selectedVectorData, 'properties.locationId', 0)
        } else if (dim[1] === 'nscenarios' && _.get(dataset, 'deltares:plotSeries') !== 'scenarios') {
          const scenarioIndex = summaryList.find(object => object.id === 'scenarios')
          return scenarioIndex.allowedValues.findIndex(object => {
            return object === summaryList.find(object => object.id === 'scenarios').chosenValue
          })
        } else if (dim[1] === 'rp' && _.get(dataset, 'deltares:plotSeries') !== 'scenarios') {
          return summaryList.find(object => object.id === 'rp').allowedValues.findIndex(object => {
            return object === summaryList[summaryList.findIndex(object => object.id === 'rp')].chosenValue
          })
        } else {
        return null
        }
      })

      if (_.get(dataset, 'deltares:plotType') !== 'bar') {
        openArray({
          store: url,
          path: path,
          mode: 'r'
        })
          .then(res => {
            res.get(slice).then(data => {
              // in some cases, transpose data array to order data properly
              // hardcoded sc dataset (stupid hack, implementation to be improved at some time)
              if (data.data.length > data.data[0].length || datasetName === 'sc') {
                data.data = _.unzip(data.data)
              }
              var series = [ {
                  data: [],
                  type: _.get(dataset, 'deltares:plotType'),
                  name: ''
                } ];
              if (typeof data.data[0].length === 'undefined') {
                // In case there is just 1 series, data.data.map(serie => does not seem to work. Resolved like this.
                series[0].data = Array.from(data.data)
                series[0].type = _.get(dataset, 'deltares:plotType')
                series[0].name = 'default'
              } else {
                series = data.data.map(serie => {
                  return {
                    type: 'line',
                    data: Array.from(serie)
                  }
                })
              }
              const variableUnit = Object.entries(_.get(dataset, `["cube:variables"].${path}.unit`))

              let cubeDimensions = _.get(dataset, 'cube:dimensions')
              const xAxis = _.get(dataset, 'deltares:plotxAxis')
              // Name based on deltares:plotSeries from STAC
              const plotSeries = _.get(dataset, 'deltares:plotSeries')

              const dimensionNames = Object.entries(_.get(dataset, `["cube:dimensions"].${plotSeries}.values`))

              // Add function to resolve decadal window, if required by dataset
              if (cubeDimensions[xAxis].description === "decade window") {

                const startDateYear = new Date(cubeDimensions[xAxis].extent[0]);
                const endDateYear = new Date(cubeDimensions[xAxis].extent[1]);

                var decadeWindowSeries = [];

                for (let y = startDateYear.getFullYear(); y <= endDateYear.getFullYear();  y += 10) {
                  decadeWindowSeries.push(y);
                }
                // replace values array with decade window series
                cubeDimensions[xAxis].values = decadeWindowSeries
              } else if (cubeDimensions[xAxis].description === "time") {
                cubeDimensions[xAxis].values = cubeDimensions[xAxis].extent
              }
              for (var i = 0; i < series.length; i++) {
                if (typeof dimensionNames[i][1] === 'number' && dimensionNames.length === series.length) {
                  var dimensionName = String(dimensionNames[i][1])
                  series[i].name = dimensionName
                } else if (typeof dimensionNames[i][1] === 'string' && dimensionNames.length === series.length) {
                  series[i].name = dimensionNames[i][1]
                } else if (dimensionNames.length !== series.length) {
                  // update name based on selection from summary
                  var serieName = summaryList.map(summary => {
                    if (summary.id === plotSeries) {
                      serieName = summary.id + ' ' + String(summary.chosenValue)
                      return serieName
                    }
                  })
                  series[i].name = serieName[i]
                }
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
      } else if (_.get(dataset, 'deltares:plotType') === 'bar') {
        const xAxisdata = []
        const series = []
        path.forEach(p => {
          return openArray({
            store: url,
            path: p,
            mode: 'r'
            })
            .then(res => {
              res.get(slice).then(zarrData => {
                // in some cases, transpose data array to order data properly
                // hardcoded sc dataset (stupid hack, implementation to be improved at some time)
                series.push(zarrData)
                xAxisdata.push(p)

                commit('addDatasetPointData', {
                  id: datasetId,
                  name: datasetName,
                  series: [{ type: 'bar', data: series }],
                  xAxis: {
                    type: 'category',
                    data: xAxisdata,
                  }
                })
              })
            })
          })
        }
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
          const rasterLayer = _.merge({layerId: dataset.id}, buildRasterLayer(layerInfo))
          commit('setActiveRasterLayer', rasterLayer)
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

