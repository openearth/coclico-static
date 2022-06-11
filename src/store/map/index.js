import getCatalog from '@/lib/request/get-catalog'
import datasets from './datasets.js'
import buildGeojsonLayer from '@/lib/mapbox/build-geojson-layer'
import matchLayerIdToProperties from '@/lib/match-layer-id-to-properties.js'
import isArray from 'lodash/isArray'
import _ from 'lodash'
import themes, { state } from './themes.js'
import { openArray } from 'zarr'
import router from '@/router'
import Vue from 'vue'
import moment from 'moment'

export default {
  modules: {
    datasets,
    themes
  },
  state: () => ({
    activeMapboxLayers: [],
    selectedPointData: {},
    activeDatasetIds: [],
    activeRasterData: {},
    activeRasterLayerId: '',
    loadingRasterLayers: false,
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
    getActiveRasterLayer (state) {
      return state.activeRasterLayerId
    },
    activeDatasetIds(state) {
      return state.activeDatasetIds
    },
    activeRasterData (state) {
      return state.activeRasterData
    },
  },
  mutations: {
    resetMap (state) {
      state.activeMapboxLayers = []
      state.activeDatasetIds = []
      state.loadingRasterLayers = false
    },
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
    setSelectedPointData(state, pointData) {
      state.selectedPointData = pointData
    },
    addDatasetPointData(state, pointData) {
      Vue.set(state.selectedPointData, `data.${pointData.id}`, pointData)
    },
    setActiveDatasetIds (state, ids) {
      state.activeDatasetIds = ids
    },
    setActiveRasterLayerId (state, id) {
      state.activeRasterLayerId = id
    },
    setRasterData (state, { data }) {
      state.activeRasterData = data
    },
    setRasterProperty (state, { prop, data }) {
      state.activeRasterData.layer.properties[prop] = data
    },
    clearActiveDatasetIds (state) {
      state.activeDatasetIds = []
    },
    setLoadingRasterLayers (state, loading) {
      state.loadingRasterLayers = loading
    },
    addActiveRasterLayer (state, { data }) {
      Vue.set(state.activeRasterData, 'layer', data)
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
      const newMin = _.get(dataset, 'properties.deltares:min', '')
      const newMax =  _.get(dataset, 'properties.deltares:max', '')
      const datasetId = _.get(dataset, 'id')
      
      
      const mapboxLayer = state.activeMapboxLayers.find(({id}) => id.includes(datasetId))
      const mapboxLayerId = _.get(mapboxLayer, 'id')
      const circleColors = _.get(mapboxLayer, 'paint.circle-color')
      //remove mapboxlayer in order and update paint
      // 
      commit('removeMapboxLayer',mapboxLayerId)
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
      commit('addMapboxLayer', mapboxLayer)

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
            // Name based on properties.deltares:plotSeries from STAC
            const plotSeries = _.get(dataset, 'properties.deltares:plotSeries')
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
    storeActiveDatasetIds ({ commit }, _ids) {
      // First set of the activeDatasetIds
      const ids = isArray(_ids) ? _ids : _ids.split(',')
      commit('setActiveDatasetIds', ids)
    },
    clearActiveDatasetIds({commit}) {
      commit('clearActiveDatasetIds')
    },
    loadLocationDataset({dispatch}, dataset) {
      const layer = matchLayerIdToProperties(dataset)
      dispatch('loadMapboxLayer',layer)
    },
    loadActiveRasterData ({ state, commit, dispatch }, dataset) {
      // Store active raster data, if null leave empty, otherwise retrieve
      // new data from link
      
      const id = dataset.id  
      if (!id) {
        commit('setRasterData', {})
        return
      }
      if (_.get(dataset, 'properties.deltares:mapService') === "GEE") {
        // implementation below is copied from BlueEarth Data, to read map layers from GEE
        console.log('Loading GEE maps')
        const links = _.get(state.datasets[id], 'links')
        const collectionUrl = links.find(child => child.title === `${id}-gee`).href
        getCatalog(collectionUrl)
          .then(dataset => {
            let links = _.get(dataset, 'links', [])
            links = links.filter(link => link.rel === 'item')
            const rasterLayer = links[links.length - 1]
            const result = links.map(serie => {
              serie.date = moment(serie.date, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm')
              return serie
          })
          dataset.links = result
          commit('setRasterData', { id: id, data: dataset })
          dispatch('loadActiveRasterLayer', rasterLayer)
        })
      } else if (_.get(dataset, 'properties.deltares:mapService') === "WMS") {
        // find layer selected with drop-down box
        console.log('Loading WMS maps')
        const layer = matchLayerIdToProperties(dataset)

        const collectionUrl = layer.href

        let links = _.get(dataset, 'links', [])
        // select link based on selection from summaries
        links = links.filter(link => link.href === collectionUrl)
        const rasterLayer = links[0]
        commit('setRasterData', { id: id, data: dataset })
        dispatch('loadActiveRasterLayer', rasterLayer)

      }
    },

    loadActiveRasterLayer ({ state, getters, commit }, rasterLayer) {
      // Load the active item (depending on activeTimestamp), this function is also
      // used to update the raster layer when the min and max has changed (using the
      // properties of the activeRasterData)
      if (!rasterLayer) {
        rasterLayer = state.activeRasterData.links.find(item => {
          return getters.activeTimestamp === item.date
        })
      }

      // If no matching timestamp found by child, use collection of invalid date
      if (!rasterLayer) {
        rasterLayer = state.activeRasterData.links.find(item => item.rel === 'item')
      }

      const properties = _.get(state.activeRasterData, 'layer.properties', {})
      // Seems properties stays empty?
      const url = new URL(rasterLayer.href)

      if (_.get(properties, 'deltares:band')) {
        url.searchParams.set('band', _.get(properties, 'deltares:band'))
      }

      if (_.get(properties, 'deltares:min')) {
        url.searchParams.set('min', _.get(properties, 'deltares:min'))
      }
      if (_.get(properties, 'deltares:max')) {
        url.searchParams.set('max', _.get(properties, 'deltares:max'))
      }
      getCatalog(url.href)
        .then(dataset => {
          // dataset loaded here is the one containing the visual assets, so url.href should point to file with this info
          commit('addActiveRasterLayer', { data: dataset })
          commit('setLoadingRasterLayers', false)
        })
    },

  },
}

