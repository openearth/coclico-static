import getCatalog from '@/lib/request/get-catalog'


export default {
  namespaced: true,

  state: () => ({
    testLayer: {
        "id": "EU_EESSL_JRC_Hist_RP_flat-74xh1t",
        "type": "circle",
        "source": {
          "url": "mapbox://global-data-viewer.6v63xk2e", 
          "type": "vector"
        },
      "source-layer": "EU_EESSL_JRC_Hist_RP_flat-74xh1t", 
      "paint": {

        "circle-radius": 5,
        "circle-stroke-color": "#1e1688",
        "circle-stroke-width": 1,
        "circle-color": [ 
              "interpolate",
                ["linear"],
                ["get", "rp_5"],
                0,
                "#00ff00",
                2,
                "#0000ff",
                3,
                "#ffff00",
                4,
                "#ff0000 "
              ],
        },
      },
    testDatasetsInActiveTheme: {
  "dd": {
		"id": "dd",
		"stac_version": "1.0.0-beta.2",
		"description": "Discharge forecasts by the Global Fluvial Forecasting System (GLOFFIS) run by Deltares, which runs global WFLOW models. This includes real-time forecasts at hundreds of locations across the world. See [the Wiki](https://publicwiki.deltares.nl/display/BED/References) for further information about GLOFFIS, and to find out more about the validity and quality of this dataset.",
		"links": [
			{
				"rel": "root",
				"href": "https://blueearthdata.org/api/static_stac/collection.json",
				"type": "application/json"
			},
			{
				"rel": "child",
				"href": "https://blueearthdata.org/api/stac/dd-gee",
				"type": "application/json",
				"title": "dd-gee"
			},
			{
				"rel": "child",
				"href": "https://blueearthdata.org/api/static_stac/dd/dd-mapbox/collection.json",
				"type": "application/json",
				"title": "dd-mapbox"
			},
			{
				"rel": "self",
				"href": "https://blueearthdata.org/api/static_stac/dd/collection.json",
				"type": "application/json"
			},
			{
				"rel": "parent",
				"href": "https://blueearthdata.org/api/static_stac/collection.json",
				"type": "application/json"
			}
		],
		"title": "Discharge",
		"extent": {
			"spatial": {
				"bbox": [
					[
						-180,
						-90,
						180,
						90
					]
				]
			},
			"temporal": {
				"interval": [
					[
						"2015-10-22T00:00:00Z",
						null
					]
				]
			}
		},
		"license": "proprietary",
		"license_use": "GLOFFIS Data Products (Water level, Surge height, Tide, Wind, Waves, Discharge, Precipitation and Air temperature): - The purpose of both the GLOFFIS (GLObal Flood Forecasting Information System) Data Products is to provide real-time discharge forecasts with global coverage (hereinafter “Forecasts”) for the sole purposes to assist with A. flood risk assessments and analyses in those areas currently lacking any forecasting capability, or B. the provision of boundary conditions for more refined local models. - User agrees NOT to use the GLOFFIS and GLOSSIS Data Products for operational purposes such as, but not limited to, providing flood Forecasts to third parties or the general public.",
		"license_warranty": "GLOFFIS Data Products: Deltares does not guarantee, or imply in any way, that the GLOFFIS Data Products, including any Forecasts resulting therefrom, will correspond to actual hydrodynamic conditions at the time of User’s intended activities.",
		"keywords": [
			"Flooding"
		],
		"providers": [
			{
				"name": "Deltares",
				"description": "Deltares is an independent institute for applied research in the field of water and subsurface.",
				"roles": [
					"producer",
					"processor"
				],
				"url": "https://www.deltares.nl"
			}
		],
		"properties": {
			"deltares:scope": "global",
			"deltares:timeSpan": "Live",
			"deltares:units": "m3/s"
    }
  },
	"cc": {
		"id": "cc",
		"stac_version": "1.0.0-beta.2",
		"description": "Discharge forecasts by the Global Fluvial Forecasting System (GLOFFIS) run by Deltares, which runs global WFLOW models. This includes real-time forecasts at hundreds of locations across the world. See [the Wiki](https://publicwiki.deltares.nl/display/BED/References) for further information about GLOFFIS, and to find out more about the validity and quality of this dataset.",
		"links": [
			{
				"rel": "root",
				"href": "https://blueearthdata.org/api/static_stac/collection.json",
				"type": "application/json"
			},
			{
				"rel": "child",
				"href": "https://blueearthdata.org/api/stac/dd-gee",
				"type": "application/json",
				"title": "dd-gee"
			},
			{
				"rel": "child",
				"href": "https://blueearthdata.org/api/static_stac/dd/dd-mapbox/collection.json",
				"type": "application/json",
				"title": "dd-mapbox"
			},
			{
				"rel": "self",
				"href": "https://blueearthdata.org/api/static_stac/dd/collection.json",
				"type": "application/json"
			},
			{
				"rel": "parent",
				"href": "https://blueearthdata.org/api/static_stac/collection.json",
				"type": "application/json"
			}
		],
		"title": "Discharge",
		"extent": {
			"spatial": {
				"bbox": [
					[
						-180,
						-90,
						180,
						90
					]
				]
			},
			"temporal": {
				"interval": [
					[
						"2015-10-22T00:00:00Z",
						null
					]
				]
			}
		},
		"license": "proprietary",
		"license_use": "GLOFFIS Data Products (Water level, Surge height, Tide, Wind, Waves, Discharge, Precipitation and Air temperature): - The purpose of both the GLOFFIS (GLObal Flood Forecasting Information System) Data Products is to provide real-time discharge forecasts with global coverage (hereinafter “Forecasts”) for the sole purposes to assist with A. flood risk assessments and analyses in those areas currently lacking any forecasting capability, or B. the provision of boundary conditions for more refined local models. - User agrees NOT to use the GLOFFIS and GLOSSIS Data Products for operational purposes such as, but not limited to, providing flood Forecasts to third parties or the general public.",
		"license_warranty": "GLOFFIS Data Products: Deltares does not guarantee, or imply in any way, that the GLOFFIS Data Products, including any Forecasts resulting therefrom, will correspond to actual hydrodynamic conditions at the time of User’s intended activities.",
		"keywords": [
			"Flooding"
		],
		"providers": [
			{
				"name": "Deltares",
				"description": "Deltares is an independent institute for applied research in the field of water and subsurface.",
				"roles": [
					"producer",
					"processor"
				],
				"url": "https://www.deltares.nl"
			}
		],
		"properties": {
			"deltares:scope": "global",
			"deltares:timeSpan": "Live",
			"deltares:units": "m3/s"
    }
  }
  },
  }),
 
  getters: {
  },
  actions: {
    loadDatasets () {
    // Retrieve the first 2 layers of the stac collection, the general metadata
    // and the childs including all datasets
    getCatalog(process.env.VUE_APP_CATALOG_URL)
      .then(datasets => {
        console.log('datasets in getCatalog')
        console.log(JSON.stringify(datasets))
/*         // Add themes to store.themes
        //const themes = _.get(datasets, 'summaries.keywords')
        //themes.forEach(theme => commit('addTheme', theme))

        const childs = datasets.links.filter(ds => ds.rel === 'child')
        return childs.forEach(child => {
          //commit('addDataset', { id: child.title })
          return getCatalog(child.href)
            .then(dataset => {
              //commit('addDataset', dataset)
              // If we start at a subroute with active dataset ids, directly
              // load the vector layers
              if (state.activeDatasetIds.includes(dataset.id)) {
                _.set(state.datasets, `${dataset.id}.visible`, true)
               // dispatch('loadVectorLayer', dataset)
               // dispatch('triggerActiveVector')
              }
              if (dataset.id === state.activeRasterLayerId) {
               // dispatch('loadActiveRasterData', dataset.id)
              }
            })
        }) */
      })
  },
  },
  mutations: {
  },
}
